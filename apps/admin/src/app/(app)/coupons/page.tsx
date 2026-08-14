"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
  type Coupon,
  type CouponInput,
} from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

const EMPTY_FORM: CouponInput = {
  code: "",
  type: "percent",
  value: 10,
  minSubtotal: 0,
  usageLimit: null,
  isActive: true,
};

export default function CouponsPage() {
  const { accessToken, hasPermission } = useAdminAuth();
  const canWrite = hasPermission("marketing.write");
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CouponInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!accessToken) return;
    getCoupons(accessToken)
      .then(setCoupons)
      .catch(() => undefined);
  };

  useEffect(load, [accessToken]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      minSubtotal: Number(coupon.minSubtotal),
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive,
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
      if (editing) {
        await updateCoupon(accessToken, editing.id, form);
      } else {
        await createCoupon(accessToken, form);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!accessToken) return;
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      await deleteCoupon(accessToken, coupon.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't delete this coupon.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Coupons</h1>
          <p className="mt-1 text-sm text-muted">Discount codes customers can apply at checkout.</p>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            <Plus size={15} />
            New Coupon
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
              {editing ? `Edit ${editing.code}` : "New Coupon"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close">
              <X size={18} className="text-muted" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Code">
              <input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className={inputClass}
              />
            </Field>
            <Field label="Type">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as CouponInput["type"] })}
                className={inputClass}
              >
                <option value="percent">Percent off</option>
                <option value="fixed">Fixed amount off</option>
              </select>
            </Field>
            <Field label={form.type === "percent" ? "Percent (e.g. 10 = 10%)" : "Amount off (₹)"}>
              <input
                required
                type="number"
                min={0}
                step="0.01"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
            <Field label="Minimum subtotal (₹)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.minSubtotal ?? 0}
                onChange={(e) => setForm({ ...form, minSubtotal: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
            <Field label="Usage limit (blank = unlimited)">
              <input
                type="number"
                min={1}
                value={form.usageLimit ?? ""}
                onChange={(e) =>
                  setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : null })
                }
                className={inputClass}
              />
            </Field>
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
            {submitting ? "Saving…" : editing ? "Save Changes" : "Create Coupon"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Discount</th>
              <th className="px-5 py-3">Min. subtotal</th>
              <th className="px-5 py-3">Used</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {coupons?.map((coupon) => (
              <tr key={coupon.id}>
                <td className="px-5 py-3 font-medium text-ink">{coupon.code}</td>
                <td className="px-5 py-3 text-muted">
                  {coupon.type === "percent" ? `${Number(coupon.value)}%` : formatMoney(Number(coupon.value))}
                </td>
                <td className="px-5 py-3 text-muted">{formatMoney(Number(coupon.minSubtotal))}</td>
                <td className="px-5 py-3 text-muted">
                  {coupon.timesUsed}
                  {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted">{formatDate(coupon.createdAt)}</td>
                <td className="px-5 py-3">
                  {canWrite && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(coupon)}
                        aria-label="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-primary"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon)}
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
        {coupons?.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted">No coupons yet.</p>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}
