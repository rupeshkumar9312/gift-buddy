import { randomInt } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { CartService } from '../cart/cart.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { toPublicUser } from './auth.mapper';
import { OtpChallenge } from './entities/otp-challenge.entity';
import { SmsService } from './sms.service';
import { GoogleAuthService } from './google-auth.service';

type TokenPayload = { sub: number; email: string | null };

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly cartService: CartService,
    private readonly smsService: SmsService,
    private readonly googleAuthService: GoogleAuthService,
    @InjectRepository(OtpChallenge)
    private readonly otpChallengeRepository: Repository<OtpChallenge>,
  ) {}

  async register(dto: RegisterDto, guestCartToken?: string) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    if (guestCartToken) {
      await this.cartService.mergeGuestCartIntoUser(user.id, guestCartToken);
    }

    return this.issueSession(user);
  }

  async login(dto: LoginDto, guestCartToken?: string) {
    const user = await this.usersService.findByEmailWithSecrets(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    const passwordMatches = await argon2.verify(
      user.passwordHash,
      dto.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    if (guestCartToken) {
      await this.cartService.mergeGuestCartIntoUser(user.id, guestCartToken);
    }

    return this.issueSession(user);
  }

  async authenticateWithGoogle(idToken: string, guestCartToken?: string) {
    const profile = await this.googleAuthService.verifyIdToken(idToken);

    let user = await this.usersService.findByGoogleId(profile.googleId);
    if (!user) {
      // The same email might already have a password (or phone) account —
      // link Google onto it instead of creating a duplicate.
      const existing = await this.usersService.findByEmail(profile.email);
      if (existing) {
        await this.usersService.linkGoogleId(existing.id, profile.googleId);
        user = existing;
      } else {
        user = await this.usersService.create({
          email: profile.email,
          emailVerifiedAt: new Date(),
          googleId: profile.googleId,
          firstName: profile.firstName || 'Google',
          lastName: profile.lastName || 'User',
        });
      }
    }

    if (guestCartToken) {
      await this.cartService.mergeGuestCartIntoUser(user.id, guestCartToken);
    }

    return this.issueSession(user);
  }

  async requestOtp(
    rawPhone: string,
  ): Promise<{ isNewUser: boolean; devOtp?: string }> {
    const phone = this.normalizePhone(rawPhone);

    const existingChallenge = await this.otpChallengeRepository.findOne({
      where: { phone },
    });
    if (
      existingChallenge &&
      Date.now() - existingChallenge.updatedAt.getTime() <
        OTP_RESEND_COOLDOWN_MS
    ) {
      throw new BadRequestException(
        'A code was already sent — please wait a minute before requesting another.',
      );
    }

    const code = randomInt(100000, 1000000).toString();
    const isProduction = this.config.get<string>('nodeEnv') === 'production';

    // Outside production, skip Twilio entirely and hand the code back in the
    // response instead — same rationale as PaymentsService's Stripe dev
    // simulator: lets the whole flow be exercised without a live account.
    if (isProduction) {
      // Send before persisting: a failed send (e.g. misconfigured Twilio)
      // should never leave a valid-but-undelivered code in place — that
      // would both strand the user and wrongly trigger the cooldown above.
      await this.smsService.sendSms(
        phone,
        `Your GiftBuddy verification code is ${code}. It expires in 5 minutes.`,
      );
    }

    const codeHash = await argon2.hash(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    if (existingChallenge) {
      existingChallenge.codeHash = codeHash;
      existingChallenge.expiresAt = expiresAt;
      existingChallenge.attempts = 0;
      await this.otpChallengeRepository.save(existingChallenge);
    } else {
      await this.otpChallengeRepository.save(
        this.otpChallengeRepository.create({ phone, codeHash, expiresAt }),
      );
    }

    const user = await this.usersService.findByPhone(phone);
    return { isNewUser: !user, devOtp: isProduction ? undefined : code };
  }

  async verifyOtpAndAuth(
    rawPhone: string,
    code: string,
    firstName: string | undefined,
    lastName: string | undefined,
    guestCartToken?: string,
  ) {
    const phone = this.normalizePhone(rawPhone);

    const challenge = await this.otpChallengeRepository
      .createQueryBuilder('challenge')
      .addSelect('challenge.codeHash')
      .where('challenge.phone = :phone', { phone })
      .getOne();

    if (!challenge || challenge.expiresAt < new Date()) {
      throw new BadRequestException(
        'That code has expired — request a new one.',
      );
    }
    if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
      throw new BadRequestException(
        'Too many incorrect attempts — request a new code.',
      );
    }

    const codeMatches = await argon2.verify(challenge.codeHash, code);
    if (!codeMatches) {
      await this.otpChallengeRepository.update(challenge.id, {
        attempts: challenge.attempts + 1,
      });
      throw new UnauthorizedException('Incorrect code');
    }

    await this.otpChallengeRepository.delete(challenge.id);

    let user = await this.usersService.findByPhone(phone);
    if (!user) {
      if (!firstName?.trim() || !lastName?.trim()) {
        throw new BadRequestException(
          'First and last name are required to create an account',
        );
      }
      user = await this.usersService.create({
        phone,
        phoneVerifiedAt: new Date(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    }

    if (guestCartToken) {
      await this.cartService.mergeGuestCartIntoUser(user.id, guestCartToken);
    }

    return this.issueSession(user);
  }

  /** Bare 10-digit numbers default to India (+91), matching this app's
   * primary market; anything already prefixed with '+' is trusted as-is. */
  private normalizePhone(rawPhone: string): string {
    const trimmed = rawPhone.trim();
    if (trimmed.startsWith('+')) {
      return trimmed;
    }
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
      return `+91${digitsOnly}`;
    }
    return `+${digitsOnly}`;
  }

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findByIdWithSecrets(payload.sub);
    if (!user?.refreshTokenHash || !user.refreshTokenExpiresAt) {
      throw new UnauthorizedException('Session has been revoked');
    }
    if (user.refreshTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Session has expired');
    }

    const tokenMatches = await argon2.verify(
      user.refreshTokenHash,
      refreshToken,
    );
    if (!tokenMatches) {
      // Stored hash doesn't match a token that verified against JWT_REFRESH_SECRET —
      // most likely an old, already-rotated token being replayed. Revoke the
      // session rather than silently accepting it.
      await this.usersService.setRefreshToken(user.id, null, null);
      throw new UnauthorizedException('Session has been revoked');
    }

    return this.issueSession(user);
  }

  async logout(userId: number) {
    await this.usersService.setRefreshToken(userId, null, null);
  }

  private async issueSession(user: User) {
    const payload: TokenPayload = { sub: user.id, email: user.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>('jwt.accessSecret'),
        expiresIn: this.config.getOrThrow<number>('jwt.accessTtlSeconds'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
        expiresIn: this.config.getOrThrow<number>('jwt.refreshTtlSeconds'),
      }),
    ]);

    const refreshTokenHash = await argon2.hash(refreshToken);
    const refreshTtlMs = this.config.getOrThrow<number>('jwt.refreshTtlMs');
    await this.usersService.setRefreshToken(
      user.id,
      refreshTokenHash,
      new Date(Date.now() + refreshTtlMs),
    );

    return { user: toPublicUser(user), accessToken, refreshToken };
  }
}
