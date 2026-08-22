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

export class UpdateGiftKitDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  subtitle?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsOptional()
  href?: string;

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
