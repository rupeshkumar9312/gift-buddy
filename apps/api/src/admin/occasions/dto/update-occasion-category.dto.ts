import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateOccasionCategoryDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  slug?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  productIds?: number[];
}
