import { Module } from '@nestjs/common';
import { LoginActivityModule } from '../../login-activity/login-activity.module';
import { AdminLoginActivityController } from './admin-login-activity.controller';

@Module({
  imports: [LoginActivityModule],
  controllers: [AdminLoginActivityController],
})
export class AdminLoginActivityModule {}
