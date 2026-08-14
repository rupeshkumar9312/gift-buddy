"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { deleteBlogPost, getBlogPosts, type AdminBlogPost } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default function BlogPage() {
  const { accessToken, hasPermission } = useAdminAuth();
  const canWrite = hasPermission("content.write");
  const [posts, setPosts] = useState<AdminBlogPost[] | null>(null);

  const load = () => {
    if (!accessToken) return;
    getBlogPosts(accessToken)
      .then(setPosts)
      .catch(() => undefined);
  };

  useEffect(load, [accessToken]);

  const handleDelete = async (post: AdminBlogPost) => {
    if (!accessToken) return;
    if (!confirm(`Delete "${post.title}"?`)) return;
    try {
      await deleteBlogPost(accessToken, post.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't delete this post.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Blog</h1>
          <p className="mt-1 text-sm text-muted">{posts?.length ?? 0} posts.</p>
        </div>
        {canWrite && (
          <Link
            href="/blog/new"
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            <Plus size={15} />
            New Post
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3">Post</th>
              <th className="px-5 py-3">Author</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Published</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {posts?.map((post) => (
              <tr key={post.id}>
                <td className="flex items-center gap-3 px-5 py-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream">
                    {post.coverAsset?.url && (
                      <Image src={post.coverAsset.url} alt={post.title} fill className="object-cover" sizes="40px" />
                    )}
                  </div>
                  <Link href={`/blog/${post.id}`} className="font-medium text-ink hover:text-primary">
                    {post.title}
                  </Link>
                </td>
                <td className="px-5 py-3 text-muted">{post.authorAdmin?.name ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      post.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted">
                  {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                </td>
                <td className="px-5 py-3">
                  {canWrite && (
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/blog/${post.id}`}
                        aria-label="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-primary"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(post)}
                        aria-label="Delete"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-primary"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts?.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
