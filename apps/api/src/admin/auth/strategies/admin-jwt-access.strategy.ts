import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type AdminAccessTokenPayload = {
  sub: number;
  email: string;
  role: string;
  permissions: string[];
};

@Injectable()
export class AdminJwtAccessStrategy extends PassportStrategy(
  Strategy,
  'admin-jwt-access',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('adminJwt.accessSecret'),
      audience: config.getOrThrow<string>('adminJwt.audience'),
    });
  }

  validate(payload: AdminAccessTokenPayload) {
    return {
      adminId: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
    };
  }
}
