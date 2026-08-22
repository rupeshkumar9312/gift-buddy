import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { CartModule } from '../cart/cart.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { OtpChallenge } from './entities/otp-challenge.entity';
import { SmsService } from './sms.service';
import { GoogleAuthService } from './google-auth.service';

@Module({
  imports: [
    UsersModule,
    CartModule,
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([OtpChallenge]),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy, SmsService, GoogleAuthService],
  exports: [AuthService],
})
export class AuthModule {}
