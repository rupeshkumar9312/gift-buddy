"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getLoginActivity, type LoginActivity, type Paginated } from "@/lib/api";
import { formatDate } from "@/lib/format";

const ACTOR_TONE: Record<LoginActivity["actorType"], string> = {
  customer: "bg-sky-100 text-sky-700",
  admin: "bg-violet-100 text-violet-700",
};

export default function LoginActivityPage() {
  const { accessToken } = useAdminAuth();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<LoginActivity> | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getLoginActivity(accessToken, page)
      .then(setResult)
      .catch(() => undefined);
  }, [accessToken, page]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Login Activity</h1>
        <p className="mt-1 text-sm text-muted">
          Audit trail of every customer and admin sign-in — {result?.meta.total ?? 0} recorded.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3">Who</th>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3">IP Address</th>
              <th className="px-5 py-3">Location</th>
              <th className="px-5 py-3">Device</th>
              <th className="px-5 py-3">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {result?.data.map((activity) => (
              <tr key={activity.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${ACTOR_TONE[activity.actorType]}`}
                    >
                      {activity.actorType}
                    </span>
                    <div>
                      <p className="font-medium text-ink">{activity.actorName ?? "Unknown"}</p>
                      <p className="text-xs text-muted">{activity.actorEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted capitalize">{activity.method}</td>
                <td className="px-5 py-3 text-muted">{activity.ipAddress}</td>
                <td className="px-5 py-3 text-muted">
                  {activity.city || activity.country ? (
                    <span className="flex items-center gap-1.5">
                      <MapPin
                        size={13}
                        className={activity.locationSource === "gps" ? "text-primary" : "text-muted"}
                      />
                      {[activity.city, activity.region, activity.country].filter(Boolean).join(", ")}
                      {activity.locationSource === "gps" && (
                        <span className="text-xs uppercase tracking-wide text-primary">GPS</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-xs text-muted/70">Unresolved</span>
                  )}
                </td>
                <td className="max-w-[220px] truncate px-5 py-3 text-xs text-muted" title={activity.userAgent ?? ""}>
                  {activity.userAgent ?? "—"}
                </td>
                <td className="px-5 py-3 text-muted">{formatDate(activity.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {result?.data.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted">No login activity recorded yet.</p>
        )}
      </div>

      {result && result.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full border border-line px-4 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-muted">
            Page {result.meta.page} of {result.meta.totalPages}
          </span>
          <button
            disabled={page >= result.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-line px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
