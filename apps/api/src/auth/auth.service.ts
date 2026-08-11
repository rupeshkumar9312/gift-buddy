import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { toPublicUser } from './auth.mapper';

type TokenPayload = { sub: number; email: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
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

    return this.issueSession(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithSecrets(dto.email);
    if (!user) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    const passwordMatches = await argon2.verify(
      user.passwordHash,
      dto.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    return this.issueSession(user);
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
