"use client";

import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { createBlogPost, type BlogPostInput } from "@/lib/api";
import { BlogPostForm } from "@/components/BlogPostForm";

export default function NewBlogPostPage() {
  const { accessToken } = useAdminAuth();
  const router = useRouter();

  const handleSubmit = async (input: BlogPostInput) => {
    if (!accessToken) return;
    const post = await createBlogPost(accessToken, input);
    router.push(`/blog/${post.id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">New Post</h1>
        <p className="mt-1 text-sm text-muted">Write a new article for the storefront blog.</p>
      </div>
      <BlogPostForm onSubmit={handleSubmit} submitLabel="Create Post" />
    </div>
  );
}
