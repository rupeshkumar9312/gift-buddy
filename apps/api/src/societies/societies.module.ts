import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Society } from './entities/society.entity';
import { SocietiesController } from './societies.controller';
import { SocietiesService } from './societies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Society])],
  controllers: [SocietiesController],
  providers: [SocietiesService],
  exports: [SocietiesService],
})
export class SocietiesModule {}
