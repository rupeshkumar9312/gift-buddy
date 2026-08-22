"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getHomeHero, updateHomeHero, type AdminHomeHero } from "@/lib/api";
import { ImageUploadField } from "@/components/ImageUploadField";

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

type FormState = {
  eyebrow: string;
  heading: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  bannerImageUrl: string;
};

function toForm(hero: AdminHomeHero): FormState {
  return {
    eyebrow: hero.eyebrow ?? "",
    heading: hero.heading,
    description: hero.description ?? "",
    primaryCtaLabel: hero.primaryCtaLabel ?? "",
    primaryCtaHref: hero.primaryCtaHref ?? "",
    secondaryCtaLabel: hero.secondaryCtaLabel ?? "",
    secondaryCtaHref: hero.secondaryCtaHref ?? "",
    bannerImageUrl: hero.bannerImage ?? "",
  };
}

export default function HomeHeroSettingsPage() {
  const { accessToken, hasPermission } = useAdminAuth();
  const canWrite = hasPermission("settings.write");
  const [form, setForm] = useState<FormState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    getHomeHero(accessToken)
      .then((hero) => setForm(toForm(hero)))
      .catch(() => undefined);
  }, [accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !form) return;
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      const hero = await updateHomeHero(accessToken, {
        eyebrow: form.eyebrow,
        heading: form.heading,
        description: form.description,
        primaryCtaLabel: form.primaryCtaLabel,
        primaryCtaHref: form.primaryCtaHref,
        secondaryCtaLabel: form.secondaryCtaLabel,
        secondaryCtaHref: form.secondaryCtaHref,
        bannerImageUrl: form.bannerImageUrl || undefined,
      });
      setForm(toForm(hero));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the home hero.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!form) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Home Hero</h1>
        <p className="mt-1 text-sm text-muted">
          Controls the banner at the top of the storefront&apos;s homepage.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex max-w-2xl flex-col gap-4 rounded-2xl border border-line bg-white p-6"
      >
        {error && <p className="rounded-xl bg-primary/5 px-4 py-2.5 text-sm text-primary">{error}</p>}
        {saved && (
          <p className="rounded-xl bg-green-50 px-4 py-2.5 text-sm text-green-700">Saved.</p>
        )}

        <Field label="Eyebrow (script text above the heading)">
          <input
            value={form.eyebrow}
            onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
            className={inputClass}
            disabled={!canWrite}
          />
        </Field>

        <Field label="Heading">
          <input
            required
            value={form.heading}
            onChange={(e) => setForm({ ...form, heading: e.target.value })}
            className={inputClass}
            disabled={!canWrite}
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
            disabled={!canWrite}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary button label">
            <input
              value={form.primaryCtaLabel}
              onChange={(e) => setForm({ ...form, primaryCtaLabel: e.target.value })}
              className={inputClass}
              disabled={!canWrite}
            />
          </Field>
          <Field label="Primary button link">
            <input
              value={form.primaryCtaHref}
              onChange={(e) => setForm({ ...form, primaryCtaHref: e.target.value })}
              placeholder="/shop"
              className={inputClass}
              disabled={!canWrite}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Secondary link label">
            <input
              value={form.secondaryCtaLabel}
              onChange={(e) => setForm({ ...form, secondaryCtaLabel: e.target.value })}
              className={inputClass}
              disabled={!canWrite}
            />
          </Field>
          <Field label="Secondary link href">
            <input
              value={form.secondaryCtaHref}
              onChange={(e) => setForm({ ...form, secondaryCtaHref: e.target.value })}
              placeholder="/about"
              className={inputClass}
              disabled={!canWrite}
            />
          </Field>
        </div>

        <Field label="Banner image">
          <div className="flex items-center gap-2">
            <input
              value={form.bannerImageUrl}
              onChange={(e) => setForm({ ...form, bannerImageUrl: e.target.value })}
              className={inputClass}
              disabled={!canWrite}
            />
            {canWrite && accessToken && (
              <ImageUploadField
                accessToken={accessToken}
                onUploaded={(url) => setForm((f) => (f ? { ...f, bannerImageUrl: url } : f))}
              />
            )}
          </div>
        </Field>

        {canWrite && (
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 self-start rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        )}
      </form>
    </div>
  );
}
