import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUser } from '../entities/admin-user.entity';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminJwtAccessStrategy } from './strategies/admin-jwt-access.strategy';
import { LoginActivityModule } from '../../login-activity/login-activity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser]),
    PassportModule,
    JwtModule.register({}),
    LoginActivityModule,
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminJwtAccessStrategy],
  exports: [AdminAuthService],
})
export class AdminAuthModule {}
