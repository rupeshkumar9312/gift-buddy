import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from '../../content/entities/blog-post.entity';
import { MediaAsset } from '../../media/entities/media-asset.entity';
import { AdminBlogController } from './admin-blog.controller';
import { AdminBlogService } from './admin-blog.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost, MediaAsset])],
  controllers: [AdminBlogController],
  providers: [AdminBlogService],
})
export class AdminBlogModule {}
