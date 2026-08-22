import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoBanner } from './entities/promo-banner.entity';
import { PromoBannersController } from './promo-banners.controller';
import { PromoBannersService } from './promo-banners.service';

@Module({
  imports: [TypeOrmModule.forFeature([PromoBanner])],
  controllers: [PromoBannersController],
  providers: [PromoBannersService],
})
export class PromoBannersModule {}
