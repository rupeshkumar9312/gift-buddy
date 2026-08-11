import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "@/lib/data";
import { SectionHeading } from "@/components/SectionHeading";

export function ArticlesPreview() {
  const posts = blogPosts.slice(0, 3);

  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Journal" title="Articles" />
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col">
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-cream">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="mt-4 text-xs uppercase tracking-wide text-muted">
              By: {post.author} &nbsp;&middot;&nbsp; {post.date}
            </p>
            <h3 className="mt-1.5 text-lg font-medium leading-snug text-ink transition group-hover:text-primary">
              {post.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
          </Link>
        ))}
      </div>
      <div className="mt-12 flex justify-center">
        <Link
          href="/blog"
          className="rounded-full border border-ink px-8 py-3 text-sm font-medium uppercase tracking-wide text-ink transition hover:border-primary hover:text-primary"
        >
          View More Articles
        </Link>
      </div>
    </section>
  );
}
