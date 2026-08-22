"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  createOccasion,
  createOccasionCategory,
  deleteOccasion,
  deleteOccasionCategory,
  getCategories,
  getOccasions,
  getProducts,
  updateOccasion,
  updateOccasionCategory,
  type AdminCategory,
  type AdminOccasion,
  type AdminProductSummary,
  type OccasionCategoryInput,
  type OccasionInput,
} from "@/lib/api";
import { ImageUploadField } from "@/components/ImageUploadField";

type FormState = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  bannerImageUrl: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  sortOrder: number;
  categoryIds: number[];
  productIds: number[];
};

const EMPTY_FORM: FormState = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  bannerImageUrl: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
  sortOrder: 0,
  categoryIds: [],
  productIds: [],
};

type OccCatFormState = {
  id: number | null;
  name: string;
  slug: string;
  sortOrder: number;
  productIds: number[];
};

const EMPTY_OCC_CAT_FORM: OccCatFormState = {
  id: null,
  name: "",
  slug: "",
  sortOrder: 0,
  productIds: [],
};

// <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm"; the API gives back
// full ISO strings.
function toDateTimeLocal(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

// Mirrors the API's own "currently active" resolution (isActive +
// startsAt/endsAt window) so the status badge reflects what shoppers
// actually see, not just the isActive toggle — a scheduled-but-not-open
// occasion like Diwali shouldn't read as "Active" before its window opens.
function occasionStatus(occasion: AdminOccasion): "active" | "scheduled" | "ended" | "disabled" {
  if (!occasion.isActive) return "disabled";
  const now = new Date();
  if (occasion.startsAt && now < new Date(occasion.startsAt)) return "scheduled";
  if (occasion.endsAt && now > new Date(occasion.endsAt)) return "ended";
  return "active";
}

const STATUS_LABEL: Record<ReturnType<typeof occasionStatus>, string> = {
  active: "Active",
  scheduled: "Scheduled",
  ended: "Ended",
  disabled: "Disabled",
};

const STATUS_CLASS: Record<ReturnType<typeof occasionStatus>, string> = {
  active: "bg-cream text-primary",
  scheduled: "bg-secondary text-ink",
  ended: "bg-line text-muted",
  disabled: "bg-line text-muted",
};

export default function OccasionsPage() {
  const { accessToken, hasPermission } = useAdminAuth();
  const canWrite = hasPermission("products.write");
  const [occasions, setOccasions] = useState<AdminOccasion[] | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [products, setProducts] = useState<AdminProductSummary[]>([]);
  const [productFilter, setProductFilter] = useState("");
  const [editing, setEditing] = useState<AdminOccasion | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [occCatForm, setOccCatForm] = useState<OccCatFormState>(EMPTY_OCC_CAT_FORM);
  const [occCatProductFilter, setOccCatProductFilter] = useState("");
  const [occCatError, setOccCatError] = useState<string | null>(null);
  const [occCatSubmitting, setOccCatSubmitting] = useState(false);

  const load = () => {
    if (!accessToken) return;
    getOccasions(accessToken)
      .then(setOccasions)
      .catch(() => undefined);
  };

  useEffect(load, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    getCategories(accessToken)
      .then(setCategories)
      .catch(() => undefined);
    getProducts(accessToken, { limit: 200 })
      .then((res) => setProducts(res.data))
      .catch(() => undefined);
  }, [accessToken]);

  const filteredProducts = useMemo(() => {
    const q = productFilter.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, productFilter]);

  // The pool an occasion-only category's products can be chosen from —
  // this occasion's own resolved gift list (its direct picks + everything
  // in its linked categories), never the whole catalog. The API enforces
  // this too; this just keeps the picker itself scoped to valid choices.
  const resolvedOccasionProducts = useMemo(() => {
    if (!editing) return [];
    return products.filter(
      (p) => editing.categoryIds.includes(p.categoryId) || editing.productIds.includes(p.id)
    );
  }, [products, editing]);

  const filteredResolvedOccasionProducts = useMemo(() => {
    const q = occCatProductFilter.trim().toLowerCase();
    if (!q) return resolvedOccasionProducts;
    return resolvedOccasionProducts.filter((p) => p.name.toLowerCase().includes(q));
  }, [resolvedOccasionProducts, occCatProductFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setProductFilter("");
    setOccCatForm(EMPTY_OCC_CAT_FORM);
    setOccCatError(null);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (occasion: AdminOccasion) => {
    setEditing(occasion);
    setForm({
      slug: occasion.slug,
      name: occasion.name,
      tagline: occasion.tagline ?? "",
      description: occasion.description ?? "",
      bannerImageUrl: occasion.bannerImage ?? "",
      startsAt: toDateTimeLocal(occasion.startsAt),
      endsAt: toDateTimeLocal(occasion.endsAt),
      isActive: occasion.isActive,
      sortOrder: occasion.sortOrder,
      categoryIds: occasion.categoryIds,
      productIds: occasion.productIds,
    });
    setProductFilter("");
    setOccCatForm(EMPTY_OCC_CAT_FORM);
    setOccCatProductFilter("");
    setOccCatError(null);
    setError(null);
    setShowForm(true);
  };

  const toggleCategory = (id: number) => {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id],
    }));
  };

  const toggleProduct = (id: number) => {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter((p) => p !== id)
        : [...f.productIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) return;
    setError(null);
    setSubmitting(true);
    try {
      const input: OccasionInput = {
        slug: form.slug,
        name: form.name,
        tagline: form.tagline || undefined,
        description: form.description || undefined,
        bannerImageUrl: form.bannerImageUrl || undefined,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
        categoryIds: form.categoryIds,
        productIds: form.productIds,
      };
      if (editing) {
        await updateOccasion(accessToken, editing.id, input);
      } else {
        await createOccasion(accessToken, input);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (occasion: AdminOccasion) => {
    if (!accessToken) return;
    if (!confirm(`Delete occasion "${occasion.name}"?`)) return;
    try {
      await deleteOccasion(accessToken, occasion.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't delete this occasion.");
    }
  };

  const toggleOccCatProduct = (id: number) => {
    setOccCatForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter((p) => p !== id)
        : [...f.productIds, id],
    }));
  };

  const openEditOccCat = (occasionCategory: AdminOccasion["occasionCategories"][number]) => {
    setOccCatForm({
      id: occasionCategory.id,
      name: occasionCategory.name,
      slug: occasionCategory.slug,
      sortOrder: occasionCategory.sortOrder,
      productIds: occasionCategory.productIds,
    });
    setOccCatProductFilter("");
    setOccCatError(null);
  };

  const handleOccCatSubmit = async () => {
    if (!accessToken || !editing) return;
    setOccCatError(null);
    setOccCatSubmitting(true);
    try {
      const input: OccasionCategoryInput = {
        name: occCatForm.name,
        slug: occCatForm.slug,
        sortOrder: occCatForm.sortOrder,
        productIds: occCatForm.productIds,
      };
      const updated = occCatForm.id
        ? await updateOccasionCategory(accessToken, editing.id, occCatForm.id, input)
        : await createOccasionCategory(accessToken, editing.id, input);
      setEditing(updated);
      setOccCatForm(EMPTY_OCC_CAT_FORM);
      setOccCatProductFilter("");
      load();
    } catch (err) {
      setOccCatError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setOccCatSubmitting(false);
    }
  };

  const handleDeleteOccCat = async (occasionCategory: AdminOccasion["occasionCategories"][number]) => {
    if (!accessToken || !editing) return;
    if (!confirm(`Delete occasion-only category "${occasionCategory.name}"?`)) return;
    try {
      const updated = await deleteOccasionCategory(accessToken, editing.id, occasionCategory.id);
      setEditing(updated);
      if (occCatForm.id === occasionCategory.id) setOccCatForm(EMPTY_OCC_CAT_FORM);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't delete this category.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Occasions</h1>
          <p className="mt-1 text-sm text-muted">
            Seasonal landing pages (Raksha Bandhan, Diwali, ...) linking to specific gifts and categories.
          </p>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            <Plus size={15} />
            New Occasion
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {editing ? `Edit ${editing.name}` : "New Occasion"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close">
              <X size={18} className="text-muted" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <Field label="Tagline">
              <input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
            <Field label="Banner image">
              <div className="flex items-center gap-2">
                <input
                  value={form.bannerImageUrl}
                  onChange={(e) => setForm({ ...form, bannerImageUrl: e.target.value })}
                  className={inputClass}
                />
                {accessToken && (
                  <ImageUploadField
                    accessToken={accessToken}
                    onUploaded={(url) => setForm((f) => ({ ...f, bannerImageUrl: url }))}
                  />
                )}
              </div>
            </Field>
            <Field label="Active">
              <label className="flex h-[42px] items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 accent-[#be7374]"
                />
                Visible on the storefront
              </label>
            </Field>
            <Field label="Starts at (optional)">
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Ends at (optional)">
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Categories">
              <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-xl border border-line p-3">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={form.categoryIds.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="h-4 w-4 accent-[#be7374]"
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Products">
              <div className="flex flex-col gap-2">
                <input
                  placeholder="Search products…"
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className={inputClass}
                />
                <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-xl border border-line p-3">
                  {filteredProducts.map((product) => (
                    <label key={product.id} className="flex items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={form.productIds.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="h-4 w-4 accent-[#be7374]"
                      />
                      {product.name}
                    </label>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-xs text-muted">No products match.</p>
                  )}
                </div>
              </div>
            </Field>
          </div>

          {editing && (
            <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-line p-5">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                  Occasion-only Categories
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Sub-filters that show up only on this occasion&rsquo;s own page — never in the
                  general Shop by Category strip or the main Categories screen. Only products
                  already part of this occasion (its picks above, or its linked categories) can be
                  tagged.
                </p>
              </div>

              {editing.occasionCategories.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {editing.occasionCategories.map((occasionCategory) => (
                    <li
                      key={occasionCategory.id}
                      className="flex items-center justify-between rounded-xl border border-line bg-cream px-4 py-2.5 text-sm"
                    >
                      <div>
                        <span className="font-medium text-ink">{occasionCategory.name}</span>
                        <span className="ml-2 text-xs text-muted">
                          {occasionCategory.productIds.length} product
                          {occasionCategory.productIds.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditOccCat(occasionCategory)}
                          aria-label="Edit"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-white hover:text-primary"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOccCat(occasionCategory)}
                          aria-label="Delete"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-white hover:text-primary"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* A plain div, not <form> — this sits inside the outer Occasion
                  form, and HTML forms can't nest (it throws a hydration
                  error otherwise). Submission is just a button onClick. */}
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <input
                    placeholder="Name (e.g. Rakhi Hampers)"
                    value={occCatForm.name}
                    onChange={(e) => setOccCatForm({ ...occCatForm, name: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    placeholder="Slug"
                    value={occCatForm.slug}
                    onChange={(e) => setOccCatForm({ ...occCatForm, slug: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    placeholder="Sort order"
                    value={occCatForm.sortOrder}
                    onChange={(e) =>
                      setOccCatForm({ ...occCatForm, sortOrder: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </div>
                <input
                  placeholder="Search this occasion's products…"
                  value={occCatProductFilter}
                  onChange={(e) => setOccCatProductFilter(e.target.value)}
                  className={inputClass}
                />
                <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-xl border border-line p-3">
                  {filteredResolvedOccasionProducts.map((product) => (
                    <label key={product.id} className="flex items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={occCatForm.productIds.includes(product.id)}
                        onChange={() => toggleOccCatProduct(product.id)}
                        className="h-4 w-4 accent-[#be7374]"
                      />
                      {product.name}
                    </label>
                  ))}
                  {resolvedOccasionProducts.length === 0 && (
                    <p className="text-xs text-muted">
                      This occasion has no picks or linked categories yet — add some above first.
                    </p>
                  )}
                  {resolvedOccasionProducts.length > 0 && filteredResolvedOccasionProducts.length === 0 && (
                    <p className="text-xs text-muted">No products match.</p>
                  )}
                </div>
                {occCatError && <p className="text-sm text-primary">{occCatError}</p>}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleOccCatSubmit}
                    disabled={occCatSubmitting || !occCatForm.name.trim() || !occCatForm.slug.trim()}
                    className="w-fit rounded-full border border-ink px-5 py-2 text-xs font-medium uppercase tracking-wide text-ink transition hover:border-primary hover:text-primary disabled:opacity-60"
                  >
                    {occCatSubmitting
                      ? "Saving…"
                      : occCatForm.id
                        ? "Save Category"
                        : "Add Occasion-only Category"}
                  </button>
                  {occCatForm.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setOccCatForm(EMPTY_OCC_CAT_FORM);
                        setOccCatError(null);
                      }}
                      className="text-xs font-medium uppercase tracking-wide text-muted hover:text-ink"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-primary">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-fit rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {submitting ? "Saving…" : editing ? "Save Changes" : "Create Occasion"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3">Occasion</th>
              <th className="px-5 py-3">Window</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Categories</th>
              <th className="px-5 py-3">Products</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {occasions?.map((occasion) => (
              <tr key={occasion.id}>
                <td className="flex items-center gap-3 px-5 py-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream">
                    {occasion.bannerImage && (
                      <Image
                        src={occasion.bannerImage}
                        alt={occasion.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-ink">{occasion.name}</span>
                    <p className="text-xs text-muted">{occasion.slug}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted">
                  {occasion.startsAt ? new Date(occasion.startsAt).toLocaleDateString() : "Any time"}
                  {occasion.endsAt ? ` – ${new Date(occasion.endsAt).toLocaleDateString()}` : ""}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[occasionStatus(occasion)]}`}
                  >
                    {STATUS_LABEL[occasionStatus(occasion)]}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted">{occasion.categories.length}</td>
                <td className="px-5 py-3 text-muted">{occasion.products.length}</td>
                <td className="px-5 py-3">
                  {canWrite && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(occasion)}
                        aria-label="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-primary"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(occasion)}
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
        {occasions?.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted">No occasions yet.</p>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className ?? ""}`}>
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}
