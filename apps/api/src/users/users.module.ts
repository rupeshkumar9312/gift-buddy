import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { UsersService } from './users.service';
import { MeController } from './me.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address])],
  controllers: [MeController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
