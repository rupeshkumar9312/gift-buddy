import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeHero } from './entities/home-hero.entity';
import { HomeHeroController } from './home-hero.controller';
import { HomeHeroService } from './home-hero.service';

@Module({
  imports: [TypeOrmModule.forFeature([HomeHero])],
  controllers: [HomeHeroController],
  providers: [HomeHeroService],
})
export class HomeHeroModule {}
