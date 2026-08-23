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

export class UpdateProductDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  slug?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  sku?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  salePrice?: number | null;

  @IsInt()
  @Min(1)
  @IsOptional()
  categoryId?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stockQty?: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  returnDays?: number | null;

  @ValidateNested({ each: true })
  @Type(() => ProductImageInputDto)
  @ArrayMinSize(1)
  @IsOptional()
  images?: ProductImageInputDto[];
}
