import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  slug?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  imageUrl?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  parentId?: number | null;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
