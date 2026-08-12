import { BlogPost } from '../entities/blog-post.entity';

export type BlogPostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  authorName: string;
  publishedAt: string | null;
};

export type BlogPostDetail = BlogPostSummary & {
  content: string;
};

export function toBlogPostSummary(post: BlogPost): BlogPostSummary {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.coverAsset?.url ?? null,
    authorName: post.authorAdmin?.name ?? 'GiftBuddy Team',
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
  };
}

export function toBlogPostDetail(post: BlogPost): BlogPostDetail {
  return { ...toBlogPostSummary(post), content: post.content };
}
