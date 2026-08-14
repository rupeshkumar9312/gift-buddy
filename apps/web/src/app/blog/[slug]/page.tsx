import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getBlogPosts } from "@/lib/api";
import { PageBanner } from "@/components/PageBanner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  return { title: post ? `${post.title} — GiftBuddy` : "Blog — GiftBuddy" };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const allPosts = await getBlogPosts();
  const others = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <PageBanner
        title={post.title}
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.title }]}
      />

      <article className="container-page py-14">
        <div className="mx-auto max-w-3xl">
          {post.coverImage && (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-cream">
              <Image src={post.coverImage} alt={post.title} fill sizes="700px" className="object-cover" priority />
            </div>
          )}
          <p className="mt-6 text-xs uppercase tracking-wide text-muted">
            By: {post.authorName}
            {post.publishedAt && (
              <>
                {" "}
                &nbsp;&middot;&nbsp; Posted on{" "}
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </>
            )}
          </p>
          <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-muted">
            <p>{post.content}</p>
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
                  {p.coverImage && (
                    <Image
                      src={p.coverImage}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
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
