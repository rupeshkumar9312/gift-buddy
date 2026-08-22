import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Occasion } from './entities/occasion.entity';
import { OccasionCategory } from './entities/occasion-category.entity';
import { OccasionsController } from './occasions.controller';
import { OccasionsService } from './occasions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Occasion, Product, OccasionCategory])],
  controllers: [OccasionsController],
  providers: [OccasionsService],
})
export class OccasionsModule {}
