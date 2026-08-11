import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPostBySlug } from "@/lib/data";
import { PageBanner } from "@/components/PageBanner";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  return { title: post ? `${post.title} — GiftBuddy` : "Blog — GiftBuddy" };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const others = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <PageBanner
        title={post.title}
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.title }]}
      />

      <article className="container-page py-14">
        <div className="mx-auto max-w-3xl">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-cream">
            <Image src={post.image} alt={post.title} fill sizes="700px" className="object-cover" priority />
          </div>
          <p className="mt-6 text-xs uppercase tracking-wide text-muted">
            By: {post.author} &nbsp;&middot;&nbsp; Posted on {post.date} &nbsp;&middot;&nbsp; {post.comments} comments
          </p>
          <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-muted">
            <p>{post.content}</p>
          </div>

          <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
            {["Gifting", "Ideas", "Lifestyle"].map((tag) => (
              <span key={tag} className="rounded-full bg-cream px-3 py-1 text-xs text-muted">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section className="container-page border-t border-line py-16">
          <h2 className="text-2xl font-medium">More Articles</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {others.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col">
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-cream">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 text-base font-medium leading-snug text-ink transition group-hover:text-primary">
                  {p.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
