"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getBlogPost, updateBlogPost, type AdminBlogPost, type BlogPostInput } from "@/lib/api";
import { BlogPostForm } from "@/components/BlogPostForm";

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const postId = Number(id);
  const { accessToken } = useAdminAuth();
  const router = useRouter();
  const [post, setPost] = useState<AdminBlogPost | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    getBlogPost(accessToken, postId)
      .then(setPost)
      .catch(() => setNotFound(true));
  }, [accessToken, postId]);

  const handleSubmit = async (input: BlogPostInput) => {
    if (!accessToken) return;
    const updated = await updateBlogPost(accessToken, postId, input);
    setPost(updated);
    router.push("/blog");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Post</h1>
        <p className="mt-1 text-sm text-muted">{post?.title}</p>
      </div>
      {notFound && <p className="text-sm text-muted">That post couldn&rsquo;t be found.</p>}
      {post && <BlogPostForm initial={post} onSubmit={handleSubmit} submitLabel="Save Changes" />}
    </div>
  );
}
