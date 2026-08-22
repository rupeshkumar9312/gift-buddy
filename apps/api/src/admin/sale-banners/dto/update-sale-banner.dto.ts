import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateSaleBannerDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  badge?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @IsOptional()
  heading?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  subtitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  note?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(60)
  @IsOptional()
  ctaLabel?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsOptional()
  ctaHref?: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  bannerImageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
