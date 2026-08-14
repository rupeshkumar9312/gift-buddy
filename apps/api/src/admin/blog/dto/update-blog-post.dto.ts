import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BlogPostStatus } from '../../../content/entities/blog-post.entity';

export class UpdateBlogPostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(220)
  @IsOptional()
  slug?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(220)
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @IsOptional()
  excerpt?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  content?: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  coverImageUrl?: string;

  @IsEnum(BlogPostStatus)
  @IsOptional()
  status?: BlogPostStatus;
}
