"use client";

import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import type { AdminCategory, AdminProductDetail, ProductInput } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ImageUploadField } from "./ImageUploadField";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

type ImageRow = { url: string; altText: string };

function toFormState(product?: AdminProductDetail) {
  return {
    slug: product?.slug ?? "",
    sku: product?.sku ?? "",
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    salePrice: product?.salePrice ? String(product.salePrice) : "",
    categoryId: product?.categoryId ?? 0,
    stockQty: product?.stockQty ?? 0,
    isFeatured: product?.isFeatured ?? false,
    isActive: product?.isActive ?? true,
  };
}

export function ProductForm({
  categories,
  initial,
  onSubmit,
  submitLabel,
}: {
  categories: AdminCategory[];
  initial?: AdminProductDetail;
  onSubmit: (input: ProductInput) => Promise<void>;
  submitLabel: string;
}) {
  const { accessToken } = useAdminAuth();
  const [form, setForm] = useState(toFormState(initial));
  const [images, setImages] = useState<ImageRow[]>(
    initial?.images.length
      ? initial.images.map((img) => ({ url: img.url, altText: img.altText ?? "" }))
      : [{ url: "", altText: "" }]
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const price = Number(form.price) || 0;
  const salePrice = form.salePrice ? Number(form.salePrice) : null;

  const updateImage = (index: number, patch: Partial<ImageRow>) => {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, ...patch } : img)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const validImages = images.filter((img) => img.url.trim().length > 0);
    if (validImages.length === 0) {
      setError("At least one image URL is required.");
      return;
    }
    if (!form.categoryId) {
      setError("Please choose a category.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        slug: form.slug,
        sku: form.sku,
        name: form.name,
        description: form.description,
        price,
        salePrice: salePrice ?? null,
        categoryId: form.categoryId,
        stockQty: form.stockQty,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        images: validImages.map((img) => ({ url: img.url, altText: img.altText || undefined })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Basic Info</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              <Field label="SKU">
                <input
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Category">
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
                  className={inputClass}
                >
                  <option value={0} disabled>
                    Select a category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Description" full>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Gallery</h2>
            <div className="mt-4 flex flex-col gap-3">
              {images.map((img, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-xs text-muted">{index === 0 ? "★" : index + 1}</span>
                  {img.url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin-pasted URLs can be any host, not worth allow-listing every domain for a form-only thumbnail
                    <img
                      src={img.url}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="h-9 w-9 shrink-0 rounded-lg bg-cream" />
                  )}
                  <input
                    placeholder="Image URL"
                    value={img.url}
                    onChange={(e) => updateImage(index, { url: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    placeholder="Alt text (optional)"
                    value={img.altText}
                    onChange={(e) => updateImage(index, { altText: e.target.value })}
                    className={`${inputClass} max-w-[180px]`}
                  />
                  {accessToken && (
                    <ImageUploadField
                      accessToken={accessToken}
                      onUploaded={(url) => updateImage(index, { url })}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                    disabled={images.length === 1}
                    aria-label="Remove image"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:text-primary disabled:opacity-30"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setImages((prev) => [...prev, { url: "", altText: "" }])}
                className="w-fit text-sm font-medium text-primary hover:underline"
              >
                + Add image
              </button>
              <p className="text-xs text-muted">The first image (★) is used as the primary/cover image.</p>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Pricing</h2>
            <div className="mt-4 flex flex-col gap-4">
              <Field label="Price (INR)">
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Sale price (optional)">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                  className={inputClass}
                />
              </Field>
              {salePrice ? (
                <p className="text-sm">
                  Storefront shows{" "}
                  <span className="font-medium text-primary">{formatMoney(salePrice)}</span>{" "}
                  <span className="text-muted line-through">{formatMoney(price)}</span>
                </p>
              ) : (
                <p className="text-sm text-ink">Storefront shows {formatMoney(price)}</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Inventory</h2>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, stockQty: Math.max(0, f.stockQty - 1) }))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition hover:border-primary hover:text-primary"
              >
                <Minus size={13} />
              </button>
              <input
                type="number"
                min="0"
                value={form.stockQty}
                onChange={(e) => setForm({ ...form, stockQty: Math.max(0, Number(e.target.value)) })}
                className="w-20 rounded-xl border border-line bg-white px-3 py-2 text-center text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, stockQty: f.stockQty + 1 }))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition hover:border-primary hover:text-primary"
              >
                <Plus size={13} />
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, stockQty: 0 }))}
                className="ml-auto text-xs font-medium text-primary hover:underline"
              >
                Mark out of stock
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Visibility</h2>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <label className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 accent-[#be7374]"
                />
                Active (visible on storefront)
              </label>
              <label className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="h-4 w-4 accent-[#be7374]"
                />
                Featured (Home page gift ideas)
              </label>
            </div>
          </section>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-full bg-primary px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}
