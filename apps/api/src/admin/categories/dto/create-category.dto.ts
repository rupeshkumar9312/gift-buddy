import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  slug: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  imageUrl?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  parentId?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number = 0;
}
