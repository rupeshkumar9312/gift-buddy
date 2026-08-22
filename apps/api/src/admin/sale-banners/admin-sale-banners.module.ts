import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleBanner } from '../../sale-banners/entities/sale-banner.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { AdminSaleBannersController } from './admin-sale-banners.controller';
import { AdminSaleBannersService } from './admin-sale-banners.service';

@Module({
  imports: [TypeOrmModule.forFeature([SaleBanner, MediaAsset])],
  controllers: [AdminSaleBannersController],
  providers: [AdminSaleBannersService],
})
export class AdminSaleBannersModule {}
