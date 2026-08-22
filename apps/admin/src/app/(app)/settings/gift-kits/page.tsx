"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  createGiftKit,
  deleteGiftKit,
  getGiftKits,
  updateGiftKit,
  type AdminGiftKit,
  type GiftKitInput,
} from "@/lib/api";
import { ImageUploadField } from "@/components/ImageUploadField";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

const EMPTY_FORM: GiftKitInput = {
  title: "",
  subtitle: "",
  href: "",
  bannerImageUrl: "",
  isActive: true,
  sortOrder: 0,
};

export default function GiftKitsPage() {
  const { accessToken, hasPermission } = useAdminAuth();
  const canWrite = hasPermission("settings.write");
  const [kits, setKits] = useState<AdminGiftKit[] | null>(null);
  const [editing, setEditing] = useState<AdminGiftKit | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GiftKitInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!accessToken) return;
    getGiftKits(accessToken)
      .then(setKits)
      .catch(() => undefined);
  };

  useEffect(load, [accessToken]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (kit: AdminGiftKit) => {
    setEditing(kit);
    setForm({
      title: kit.title,
      subtitle: kit.subtitle ?? "",
      href: kit.href,
      bannerImageUrl: kit.bannerImage ?? "",
      isActive: kit.isActive,
      sortOrder: kit.sortOrder,
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
      const input: GiftKitInput = {
        ...form,
        bannerImageUrl: form.bannerImageUrl || undefined,
      };
      if (editing) {
        await updateGiftKit(accessToken, editing.id, input);
      } else {
        await createGiftKit(accessToken, input);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (kit: AdminGiftKit) => {
    if (!accessToken) return;
    try {
      await updateGiftKit(accessToken, kit.id, { isActive: !kit.isActive });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't update this gift kit.");
    }
  };

  const handleDelete = async (kit: AdminGiftKit) => {
    if (!accessToken) return;
    if (!confirm(`Delete gift kit "${kit.title}"?`)) return;
    try {
      await deleteGiftKit(accessToken, kit.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't delete this gift kit.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gift Kits</h1>
          <p className="mt-1 text-sm text-muted">
            The &quot;Gift Kits &amp; Baskets&quot; cards on the homepage. Hidden entirely when there are none active.
          </p>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            <Plus size={15} />
            New Kit
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
              {editing ? `Edit ${editing.title}` : "New Gift Kit"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close">
              <X size={18} className="text-muted" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-muted">Title</span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-muted">Subtitle</span>
              <input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="6 items"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="text-muted">Link</span>
              <input
                required
                value={form.href}
                onChange={(e) => setForm({ ...form, href: e.target.value })}
                placeholder="/shop?category=gift-hampers"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="text-muted">Image</span>
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
            {submitting ? "Saving…" : editing ? "Save Changes" : "Create Kit"}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {kits?.map((kit) => (
          <div
            key={kit.id}
            className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream">
              {kit.bannerImage && (
                <Image src={kit.bannerImage} alt={kit.title} fill className="object-cover" sizes="64px" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{kit.title}</p>
              <p className="truncate text-xs text-muted">
                {kit.subtitle ? `${kit.subtitle} · ` : ""}
                {kit.href}
              </p>
            </div>
            <button
              type="button"
              disabled={!canWrite}
              onClick={() => handleToggleActive(kit)}
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed ${
                kit.isActive
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {kit.isActive ? "Active" : "Inactive"}
            </button>
            {canWrite && (
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(kit)}
                  aria-label="Edit"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-primary"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(kit)}
                  aria-label="Delete"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-primary"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
        {kits?.length === 0 && (
          <p className="rounded-2xl border border-line bg-white px-5 py-8 text-center text-sm text-muted">
            No gift kits yet — the homepage section stays hidden until you add one.
          </p>
        )}
      </div>
    </div>
  );
}
