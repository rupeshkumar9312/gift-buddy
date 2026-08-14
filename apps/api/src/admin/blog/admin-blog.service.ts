import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { detectMediaProvider } from '../../media/media-provider.util';
import {
  BlogPost,
  BlogPostStatus,
} from '../../content/entities/blog-post.entity';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

type MysqlError = { code?: string };

@Injectable()
export class AdminBlogService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogRepository: Repository<BlogPost>,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
  ) {}

  findAll(): Promise<BlogPost[]> {
    return this.blogRepository.find({
      relations: ['coverAsset', 'authorAdmin'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<BlogPost> {
    const post = await this.blogRepository.findOne({
      where: { id },
      relations: ['coverAsset', 'authorAdmin'],
    });
    if (!post) {
      throw new NotFoundException(`Blog post ${id} not found`);
    }
    return post;
  }

  async create(
    dto: CreateBlogPostDto,
    authorAdminId: number,
  ): Promise<BlogPost> {
    const coverAssetId = await this.resolveCoverAssetId(dto.coverImageUrl);
    const status = dto.status ?? BlogPostStatus.DRAFT;
    const post = this.blogRepository.create({
      slug: dto.slug,
      title: dto.title,
      excerpt: dto.excerpt,
      content: dto.content,
      coverAssetId,
      authorAdminId,
      status,
      publishedAt: status === BlogPostStatus.PUBLISHED ? new Date() : null,
    });
    return this.save(post);
  }

  async update(id: number, dto: UpdateBlogPostDto): Promise<BlogPost> {
    const post = await this.findOne(id);
    const wasPublished = post.status === BlogPostStatus.PUBLISHED;

    if (dto.slug !== undefined) post.slug = dto.slug;
    if (dto.title !== undefined) post.title = dto.title;
    if (dto.excerpt !== undefined) post.excerpt = dto.excerpt;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.status !== undefined) post.status = dto.status;
    if (dto.coverImageUrl !== undefined) {
      post.coverAssetId = await this.resolveCoverAssetId(dto.coverImageUrl);
    }
    if (!wasPublished && post.status === BlogPostStatus.PUBLISHED) {
      post.publishedAt = new Date();
    }

    return this.save(post);
  }

  async remove(id: number): Promise<void> {
    const result = await this.blogRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Blog post ${id} not found`);
    }
  }

  private async resolveCoverAssetId(url?: string): Promise<number | null> {
    if (!url) return null;
    const asset = await this.mediaAssetRepository.save(
      this.mediaAssetRepository.create({
        url,
        provider: detectMediaProvider(url),
      }),
    );
    return asset.id;
  }

  private async save(post: BlogPost): Promise<BlogPost> {
    try {
      return await this.blogRepository.save(post);
    } catch (error) {
      const mysqlError = error as MysqlError;
      if (mysqlError.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'A blog post with that slug already exists',
        );
      }
      throw error;
    }
  }
}
