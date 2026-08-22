import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoBanner } from '../../promo-banners/entities/promo-banner.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { AdminPromoBannersController } from './admin-promo-banners.controller';
import { AdminPromoBannersService } from './admin-promo-banners.service';

@Module({
  imports: [TypeOrmModule.forFeature([PromoBanner, MediaAsset])],
  controllers: [AdminPromoBannersController],
  providers: [AdminPromoBannersService],
})
export class AdminPromoBannersModule {}
