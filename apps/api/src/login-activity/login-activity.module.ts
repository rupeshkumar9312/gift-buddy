import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginActivity } from './entities/login-activity.entity';
import { LoginActivityService } from './login-activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([LoginActivity])],
  providers: [LoginActivityService],
  exports: [LoginActivityService],
})
export class LoginActivityModule {}
