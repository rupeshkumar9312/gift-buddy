import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Society } from '../../societies/entities/society.entity';
import { AdminSocietiesController } from './admin-societies.controller';
import { AdminSocietiesService } from './admin-societies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Society])],
  controllers: [AdminSocietiesController],
  providers: [AdminSocietiesService],
})
export class AdminSocietiesModule {}
