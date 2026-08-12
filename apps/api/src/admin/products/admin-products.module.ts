import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../products/entities/product.entity';
import { ProductImage } from '../../products/entities/product-image.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, MediaAsset])],
  controllers: [AdminProductsController],
  providers: [AdminProductsService],
})
export class AdminProductsModule {}
