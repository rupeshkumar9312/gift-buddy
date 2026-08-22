import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateOccasionDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  slug?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  bannerImageUrl?: string;

  @IsDateString()
  @IsOptional()
  startsAt?: string | null;

  @IsDateString()
  @IsOptional()
  endsAt?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  categoryIds?: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  productIds?: number[];
}
