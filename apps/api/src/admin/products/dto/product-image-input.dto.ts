import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class ProductImageInputDto {
  @IsUrl({ require_tld: false })
  url: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  altText?: string;
}
