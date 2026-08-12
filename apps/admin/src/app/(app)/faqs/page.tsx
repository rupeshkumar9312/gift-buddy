"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { createFaq, deleteFaq, getFaqs, updateFaq, type AdminFaq, type FaqInput } from "@/lib/api";

const GROUPS: FaqInput["group"][] = ["shipping", "returns", "orders"];
const GROUP_LABEL: Record<FaqInput["group"], string> = {
  shipping: "Shipping & Delivery",
  returns: "Returns & Refunds",
  orders: "Orders & Gifting",
};

const EMPTY_FORM: FaqInput = { group: "shipping", question: "", answer: "", sortOrder: 0 };

export default function FaqsPage() {
  const { accessToken, hasPermission } = useAdminAuth();
  const canWrite = hasPermission("content.write");
  const [faqs, setFaqs] = useState<AdminFaq[] | null>(null);
  const [editing, setEditing] = useState<AdminFaq | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FaqInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!accessToken) return;
    getFaqs(accessToken)
      .then(setFaqs)
      .catch(() => undefined);
  };

  useEffect(load, [accessToken]);

  const openCreate = (group?: FaqInput["group"]) => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, group: group ?? "shipping" });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (faq: AdminFaq) => {
    setEditing(faq);
    setForm({ group: faq.group, question: faq.question, answer: faq.answer, sortOrder: faq.sortOrder });
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
        await updateFaq(accessToken, editing.id, form);
      } else {
        await createFaq(accessToken, form);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (faq: AdminFaq) => {
    if (!accessToken) return;
    if (!confirm(`Delete this FAQ?`)) return;
    try {
      await deleteFaq(accessToken, faq.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't delete this FAQ.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">FAQs</h1>
          <p className="mt-1 text-sm text-muted">Grouped questions shown on the storefront FAQ page.</p>
        </div>
        {canWrite && (
          <button
            onClick={() => openCreate()}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            <Plus size={15} />
            New FAQ
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
              {editing ? "Edit FAQ" : "New FAQ"}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close">
              <X size={18} className="text-muted" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Group">
              <select
                value={form.group}
                onChange={(e) => setForm({ ...form, group: e.target.value as FaqInput["group"] })}
                className={inputClass}
              >
                {GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {GROUP_LABEL[g]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                value={form.sortOrder ?? 0}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Question">
            <input
              required
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Answer">
            <textarea
              required
              rows={4}
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              className={inputClass}
            />
          </Field>
          {error && <p className="text-sm text-primary">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-fit rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {submitting ? "Saving…" : editing ? "Save Changes" : "Create FAQ"}
          </button>
        </form>
      )}

      {GROUPS.map((group) => (
        <div key={group} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{GROUP_LABEL[group]}</h2>
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <ul className="divide-y divide-line">
              {faqs
                ?.filter((f) => f.group === group)
                .map((faq) => (
                  <li key={faq.id} className="flex items-start justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-ink">{faq.question}</p>
                      <p className="mt-1 text-sm text-muted">{faq.answer}</p>
                    </div>
                    {canWrite && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => openEdit(faq)}
                          aria-label="Edit"
                          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-primary"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(faq)}
                          aria-label="Delete"
                          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-primary"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              {faqs && faqs.filter((f) => f.group === group).length === 0 && (
                <li className="px-5 py-6 text-center text-sm text-muted">No FAQs in this group.</li>
              )}
            </ul>
          </div>
        </div>
      ))}
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
