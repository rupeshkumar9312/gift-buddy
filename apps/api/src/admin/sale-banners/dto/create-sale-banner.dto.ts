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

export class CreateSaleBannerDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  badge?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  heading: string;

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
  ctaLabel: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  ctaHref: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  bannerImageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number = 0;
}
