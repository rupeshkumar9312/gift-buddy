import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { AdminUser } from '../entities/admin-user.entity';
import { AdminLoginDto } from './dto/admin-login.dto';
import { toPublicAdmin } from './admin-auth.mapper';

type TokenPayload = {
  sub: number;
  email: string;
  role: string;
  permissions: string[];
};

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminRepository: Repository<AdminUser>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private withSecrets() {
    return this.adminRepository
      .createQueryBuilder('admin')
      .addSelect('admin.passwordHash')
      .addSelect('admin.refreshTokenHash')
      .leftJoinAndSelect('admin.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permissions');
  }

  async login(dto: AdminLoginDto) {
    const admin = await this.withSecrets()
      .where('admin.email = :email', { email: dto.email })
      .getOne();

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    const passwordMatches = await argon2.verify(
      admin.passwordHash,
      dto.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    admin.lastLoginAt = new Date();
    await this.adminRepository.save(admin);

    return this.issueSession(admin);
  }

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('adminJwt.refreshSecret'),
        audience: this.config.getOrThrow<string>('adminJwt.audience'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const admin = await this.withSecrets()
      .where('admin.id = :id', { id: payload.sub })
      .getOne();

    if (
      !admin?.isActive ||
      !admin.refreshTokenHash ||
      !admin.refreshTokenExpiresAt
    ) {
      throw new UnauthorizedException('Session has been revoked');
    }
    if (admin.refreshTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Session has expired');
    }

    const tokenMatches = await argon2.verify(
      admin.refreshTokenHash,
      refreshToken,
    );
    if (!tokenMatches) {
      await this.setRefreshToken(admin.id, null, null);
      throw new UnauthorizedException('Session has been revoked');
    }

    return this.issueSession(admin);
  }

  async logout(adminId: number) {
    await this.setRefreshToken(adminId, null, null);
  }

  async me(adminId: number) {
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
    });
    if (!admin) {
      throw new UnauthorizedException();
    }
    return toPublicAdmin(admin);
  }

  private async setRefreshToken(
    adminId: number,
    refreshTokenHash: string | null,
    expiresAt: Date | null,
  ) {
    await this.adminRepository.update(adminId, {
      refreshTokenHash,
      refreshTokenExpiresAt: expiresAt,
    });
  }

  private async issueSession(admin: AdminUser) {
    const payload: TokenPayload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role.name,
      permissions: admin.role.permissions.map((p) => p.key),
    };
    const audience = this.config.getOrThrow<string>('adminJwt.audience');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>('adminJwt.accessSecret'),
        expiresIn: this.config.getOrThrow<number>('adminJwt.accessTtlSeconds'),
        audience,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>('adminJwt.refreshSecret'),
        expiresIn: this.config.getOrThrow<number>('adminJwt.refreshTtlSeconds'),
        audience,
      }),
    ]);

    const refreshTokenHash = await argon2.hash(refreshToken);
    const refreshTtlMs = this.config.getOrThrow<number>(
      'adminJwt.refreshTtlMs',
    );
    await this.setRefreshToken(
      admin.id,
      refreshTokenHash,
      new Date(Date.now() + refreshTtlMs),
    );

    return { admin: toPublicAdmin(admin), accessToken, refreshToken };
  }
}
