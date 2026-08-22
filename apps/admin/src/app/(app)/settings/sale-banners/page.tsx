"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  createSaleBanner,
  deleteSaleBanner,
  getSaleBanners,
  updateSaleBanner,
  type AdminSaleBanner,
  type SaleBannerInput,
} from "@/lib/api";
import { ImageUploadField } from "@/components/ImageUploadField";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

const EMPTY_FORM: SaleBannerInput = {
  badge: "",
  heading: "",
  subtitle: "",
  note: "",
  ctaLabel: "",
  ctaHref: "",
  bannerImageUrl: "",
  isActive: true,
  sortOrder: 0,
};

export default function SaleBannersPage() {
  const { accessToken, hasPermission } = useAdminAuth();
  const canWrite = hasPermission("settings.write");
  const [banners, setBanners] = useState<AdminSaleBanner[] | null>(null);
  const [editing, setEditing] = useState<AdminSaleBanner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SaleBannerInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!accessToken) return;
    getSaleBanners(accessToken)
      .then(setBanners)
      .catch(() => undefined);
  };

  useEffect(load, [accessToken]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (banner: AdminSaleBanner) => {
    setEditing(banner);
    setForm({
      badge: banner.badge ?? "",
      heading: banner.heading,
      subtitle: banner.subtitle ?? "",
      note: banner.note ?? "",
      ctaLabel: banner.ctaLabel,
      ctaHref: banner.ctaHref,
      bannerImageUrl: banner.bannerImage ?? "",
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
    });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) return;
    setError(null);
    setSubmitting(true);
    try {
      const input: SaleBannerInput = {
        ...form,
        bannerImageUrl: form.bannerImageUrl || undefined,
      };
      if (editing) {
        await updateSaleBanner(accessToken, editing.id, input);
      } else {
        await createSaleBanner(accessToken, input);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (banner: AdminSaleBanner) => {
    if (!accessToken) return;
    try {
      await updateSaleBanner(accessToken, banner.id, { isActive: !banner.isActive });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't update this banner.");
    }
  };

  const handleDelete = async (banner: AdminSaleBanner) => {
    if (!accessToken) return;
    if (!confirm(`Delete banner "${banner.heading}"?`)) return;
    try {
      await deleteSaleBanner(accessToken, banner.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't delete this banner.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sale Banners</h1>
          <p className="mt-1 text-sm text-muted">
            The pair of dark sale cards on the homepage. Hidden entirely when there are none active.
          </p>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            <Plus size={15} />
            New Banner
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {editing ? `Edit ${editing.heading}` : "New Banner"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close">
              <X size={18} className="text-muted" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-muted">Badge (pill above heading)</span>
              <input
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="Sale 50% Off"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-muted">Heading</span>
              <input
                required
                value={form.heading}
                onChange={(e) => setForm({ ...form, heading: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-muted">Subtitle</span>
              <input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-muted">Note (small print, e.g. promo code)</span>
              <input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Code: GRS18"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-muted">Button label</span>
              <input
                required
                value={form.ctaLabel}
                onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-muted">Button link</span>
              <input
                required
                value={form.ctaHref}
                onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
                placeholder="/shop"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="text-muted">Banner image</span>
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
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-muted">Sort order</span>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-2 self-end text-sm text-ink">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active
            </label>
          </div>
          {error && <p className="text-sm text-primary">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-fit rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {submitting ? "Saving…" : editing ? "Save Changes" : "Create Banner"}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {banners?.map((banner) => (
          <div
            key={banner.id}
            className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
              {banner.bannerImage && (
                <Image src={banner.bannerImage} alt={banner.heading} fill className="object-cover" sizes="64px" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{banner.heading}</p>
              <p className="truncate text-xs text-muted">
                {banner.badge ? `${banner.badge} · ` : ""}
                {banner.ctaLabel} → {banner.ctaHref}
              </p>
            </div>
            <button
              type="button"
              disabled={!canWrite}
              onClick={() => handleToggleActive(banner)}
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed ${
                banner.isActive
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {banner.isActive ? "Active" : "Inactive"}
            </button>
            {canWrite && (
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(banner)}
                  aria-label="Edit"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-primary"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(banner)}
                  aria-label="Delete"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-primary"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
        {banners?.length === 0 && (
          <p className="rounded-2xl border border-line bg-white px-5 py-8 text-center text-sm text-muted">
            No sale banners yet — the homepage section stays hidden until you add one.
          </p>
        )}
      </div>
    </div>
  );
}
