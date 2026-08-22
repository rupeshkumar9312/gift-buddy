import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../categories/entities/category.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { Product } from '../../products/entities/product.entity';
import { Occasion } from '../../occasions/entities/occasion.entity';
import { OccasionCategory } from '../../occasions/entities/occasion-category.entity';
import { AdminOccasionsController } from './admin-occasions.controller';
import { AdminOccasionsService } from './admin-occasions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Occasion,
      Category,
      Product,
      MediaAsset,
      OccasionCategory,
    ]),
  ],
  controllers: [AdminOccasionsController],
  providers: [AdminOccasionsService],
})
export class AdminOccasionsModule {}
