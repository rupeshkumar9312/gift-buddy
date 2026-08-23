import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ProductImageInputDto } from './product-image-input.dto';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  @MinLength(1)
  sku: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  salePrice?: number;

  @IsInt()
  @Min(1)
  categoryId: number;

  @IsInt()
  @Min(0)
  stockQty: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsInt()
  @Min(0)
  @IsOptional()
  returnDays?: number | null;

  @IsInt()
  @Min(1)
  @IsOptional()
  deliveryEstimateDays?: number | null;

  @ValidateNested({ each: true })
  @Type(() => ProductImageInputDto)
  @ArrayMinSize(1)
  images: ProductImageInputDto[];
}
