import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateHomeHeroDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  eyebrow?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  heading?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  primaryCtaLabel?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  primaryCtaHref?: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  secondaryCtaLabel?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  secondaryCtaHref?: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  bannerImageUrl?: string;
}
