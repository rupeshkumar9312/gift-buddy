import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BlogPostStatus } from '../../../content/entities/blog-post.entity';

export class CreateBlogPostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(220)
  slug: string;

  @IsString()
  @MinLength(1)
  @MaxLength(220)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  excerpt: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  coverImageUrl?: string;

  @IsEnum(BlogPostStatus)
  @IsOptional()
  status?: BlogPostStatus = BlogPostStatus.DRAFT;
}
