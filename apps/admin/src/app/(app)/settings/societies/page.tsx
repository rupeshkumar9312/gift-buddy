"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  createSociety,
  deleteSociety,
  getSocieties,
  updateSociety,
  type Society,
  type SocietyInput,
} from "@/lib/api";
import { formatDate } from "@/lib/format";

const EMPTY_FORM: SocietyInput = {
  name: "",
  isActive: true,
};

export default function SocietiesPage() {
  const { accessToken, hasPermission } = useAdminAuth();
  const canWrite = hasPermission("settings.write");
  const [societies, setSocieties] = useState<Society[] | null>(null);
  const [editing, setEditing] = useState<Society | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SocietyInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!accessToken) return;
    getSocieties(accessToken)
      .then(setSocieties)
      .catch(() => undefined);
  };

  useEffect(load, [accessToken]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (society: Society) => {
    setEditing(society);
    setForm({ name: society.name, isActive: society.isActive });
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
        await updateSociety(accessToken, editing.id, form);
      } else {
        await createSociety(accessToken, form);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (society: Society) => {
    if (!accessToken) return;
    try {
      await updateSociety(accessToken, society.id, { isActive: !society.isActive });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't update this society.");
    }
  };

  const handleDelete = async (society: Society) => {
    if (!accessToken) return;
    if (!confirm(`Delete society "${society.name}"?`)) return;
    try {
      await deleteSociety(accessToken, society.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't delete this society.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Societies</h1>
          <p className="mt-1 text-sm text-muted">
            Societies customers can pick from at checkout. Only active societies appear there.
          </p>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            <Plus size={15} />
            New Society
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
              {editing ? `Edit ${editing.name}` : "New Society"}
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
            {submitting ? "Saving…" : editing ? "Save Changes" : "Create Society"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {societies?.map((society) => (
              <tr key={society.id}>
                <td className="px-5 py-3 font-medium text-ink">{society.name}</td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    disabled={!canWrite}
                    onClick={() => handleToggleActive(society)}
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed ${
                      society.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {society.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-5 py-3 text-muted">{formatDate(society.createdAt)}</td>
                <td className="px-5 py-3">
                  {canWrite && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(society)}
                        aria-label="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-primary"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(society)}
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
        {societies?.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted">No societies yet.</p>
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
