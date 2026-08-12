import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../categories/entities/category.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { Product } from '../../products/entities/product.entity';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminCategoriesService } from './admin-categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, MediaAsset, Product])],
  controllers: [AdminCategoriesController],
  providers: [AdminCategoriesService],
})
export class AdminCategoriesModule {}
