import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeHero } from '../../home-hero/entities/home-hero.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { AdminHomeHeroController } from './admin-home-hero.controller';
import { AdminHomeHeroService } from './admin-home-hero.service';

@Module({
  imports: [TypeOrmModule.forFeature([HomeHero, MediaAsset])],
  controllers: [AdminHomeHeroController],
  providers: [AdminHomeHeroService],
})
export class AdminHomeHeroModule {}
