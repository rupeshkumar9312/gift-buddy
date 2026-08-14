import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBlogPosts } from "@/lib/api";
import { PageBanner } from "@/components/PageBanner";

export const metadata: Metadata = { title: "Blog — GiftBuddy" };

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

  return (
    <>
      <PageBanner title="Our Blog" crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]} />

      <div className="container-page py-14">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-14">
          {blogPosts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden rounded-2xl bg-cream">
                {post.coverImage && (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 700px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </Link>
              <p className="mt-5 text-xs uppercase tracking-wide text-muted">
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
              <Link href={`/blog/${post.slug}`}>
                <h2 className="mt-2 text-2xl font-medium leading-snug text-ink transition group-hover:text-primary">
                  {post.title}
                </h2>
              </Link>
              <p className="mt-3 leading-relaxed text-muted">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-block text-sm font-medium uppercase tracking-wide text-primary underline underline-offset-4"
              >
                Continue Reading
              </Link>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
