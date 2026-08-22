import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleBanner } from './entities/sale-banner.entity';
import { SaleBannersController } from './sale-banners.controller';
import { SaleBannersService } from './sale-banners.service';

@Module({
  imports: [TypeOrmModule.forFeature([SaleBanner])],
  controllers: [SaleBannersController],
  providers: [SaleBannersService],
})
export class SaleBannersModule {}
