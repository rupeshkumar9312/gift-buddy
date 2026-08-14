import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { BlogPost, BlogPostStatus } from '../entities/blog-post.entity';
import {
  BlogPostDetail,
  BlogPostSummary,
  toBlogPostDetail,
  toBlogPostSummary,
} from './blog.mapper';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogRepository: Repository<BlogPost>,
  ) {}

  async findPublished(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<BlogPostSummary>> {
    const [posts, total] = await this.blogRepository.findAndCount({
      where: { status: BlogPostStatus.PUBLISHED },
      relations: ['coverAsset', 'authorAdmin'],
      order: { publishedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return new PaginatedResponse(
      posts.map(toBlogPostSummary),
      total,
      page,
      limit,
    );
  }

  async findPublishedBySlug(slug: string): Promise<BlogPostDetail> {
    const post = await this.blogRepository.findOne({
      where: { slug, status: BlogPostStatus.PUBLISHED },
      relations: ['coverAsset', 'authorAdmin'],
    });
    if (!post) {
      throw new NotFoundException(`Blog post "${slug}" not found`);
    }
    return toBlogPostDetail(post);
  }
}
