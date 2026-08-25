"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  getReturnRequests,
  updateReturnRequest,
  type AdminReturnRequest,
  type ReturnRequestStatus,
} from "@/lib/api";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

const STATUS_TABS: (ReturnRequestStatus | "all")[] = ["all", "requested", "approved", "rejected"];

export default function ReturnRequestsPage() {
  const { accessToken, hasPermission } = useAdminAuth();
  const canWrite = hasPermission("orders.write");
  const [status, setStatus] = useState<ReturnRequestStatus | "all">("all");
  const [requests, setRequests] = useState<AdminReturnRequest[] | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!accessToken) return;
    getReturnRequests(accessToken, status === "all" ? undefined : status)
      .then(setRequests)
      .catch(() => undefined);
  };

  useEffect(load, [accessToken, status]);

  const handleResolve = async (id: number, next: "approved" | "rejected") => {
    if (!accessToken) return;
    setSubmitting(true);
    try {
      await updateReturnRequest(accessToken, id, { status: next, adminNote: note || undefined });
      setResolvingId(null);
      setNote("");
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't update this return request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Returns</h1>
        <p className="mt-1 text-sm text-muted">{requests?.length ?? 0} requests.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatus(tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
              status === tab ? "bg-primary text-white" : "border border-line text-muted hover:text-ink"
            }`}
          >
            {tab === "all" ? "All" : tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {requests?.map((request) => (
          <div key={request.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">
                  {request.productName} <span className="font-normal text-muted">× {request.quantity}</span>
                </p>
                <p className="text-xs text-muted">
                  Order {request.orderNumber} &middot; {request.customerEmail} &middot;{" "}
                  {formatDate(request.requestedAt)}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </div>

            <p className="mt-3 rounded-xl bg-cream px-4 py-2.5 text-sm text-ink">{request.reason}</p>

            {request.adminNote && (
              <p className="mt-2 text-xs text-muted">Admin note: {request.adminNote}</p>
            )}

            {canWrite && request.status === "requested" && (
              <div className="mt-4">
                {resolvingId === request.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Note for the customer (optional)"
                      className="w-full max-w-sm rounded-xl border border-line bg-white px-4 py-2 text-sm outline-none focus:border-primary"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleResolve(request.id, "approved")}
                        disabled={submitting}
                        className="rounded-full bg-primary px-5 py-2 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleResolve(request.id, "rejected")}
                        disabled={submitting}
                        className="rounded-full border border-line px-5 py-2 text-xs font-medium uppercase tracking-wide text-ink transition hover:border-primary hover:text-primary disabled:opacity-60"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setResolvingId(null);
                          setNote("");
                        }}
                        disabled={submitting}
                        className="text-xs font-medium uppercase tracking-wide text-muted hover:text-ink"
                      >
                        Never mind
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setResolvingId(request.id)}
                    className="rounded-full border border-line px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink transition hover:border-primary hover:text-primary"
                  >
                    Review
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {requests?.length === 0 && (
          <p className="rounded-2xl border border-line bg-white px-5 py-8 text-center text-sm text-muted">
            No return requests in this view.
          </p>
        )}
      </div>
    </div>
  );
}
