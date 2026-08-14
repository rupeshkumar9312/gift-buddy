"use client";

import { useState } from "react";
import type { AdminBlogPost, BlogPostInput } from "@/lib/api";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ImageUploadField } from "./ImageUploadField";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

function toFormState(post?: AdminBlogPost): BlogPostInput {
  return {
    slug: post?.slug ?? "",
    title: post?.title ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    coverImageUrl: post?.coverAsset?.url ?? "",
    status: post?.status ?? "draft",
  };
}

export function BlogPostForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: AdminBlogPost;
  onSubmit: (input: BlogPostInput) => Promise<void>;
  submitLabel: string;
}) {
  const { accessToken } = useAdminAuth();
  const [form, setForm] = useState(toFormState(initial));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        coverImageUrl: form.coverImageUrl || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Post details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title">
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Slug">
            <input
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Excerpt">
          <textarea
            required
            rows={2}
            maxLength={500}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Content">
          <textarea
            required
            rows={10}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Cover image URL">
            <div className="flex items-center gap-2">
              <input
                value={form.coverImageUrl ?? ""}
                onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                className={inputClass}
              />
              {accessToken && (
                <ImageUploadField
                  accessToken={accessToken}
                  onUploaded={(url) => setForm((f) => ({ ...f, coverImageUrl: url }))}
                />
              )}
            </div>
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as BlogPostInput["status"] })}
              className={inputClass}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
        </div>
      </div>

      {error && <p className="text-sm text-primary">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}
