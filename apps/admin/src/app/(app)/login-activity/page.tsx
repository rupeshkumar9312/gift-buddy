"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getLoginActivity, type LoginActivity, type Paginated } from "@/lib/api";
import { formatDate } from "@/lib/format";

// Leaflet touches `window` at import time, so it can only ever run in the
// browser — ssr:false keeps Next from trying (and failing) to render it
// during the server pass of this otherwise client-rendered page.
const LoginActivityMap = dynamic(
  () => import("@/components/LoginActivityMap").then((mod) => mod.LoginActivityMap),
  { ssr: false }
);

const ACTOR_TONE: Record<LoginActivity["actorType"], string> = {
  customer: "bg-sky-100 text-sky-700",
  admin: "bg-violet-100 text-violet-700",
};

const MAP_SAMPLE_SIZE = 200;

export default function LoginActivityPage() {
  const { accessToken } = useAdminAuth();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<LoginActivity> | null>(null);
  const [mapActivities, setMapActivities] = useState<LoginActivity[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    getLoginActivity(accessToken, page)
      .then(setResult)
      .catch(() => undefined);
  }, [accessToken, page]);

  // A separate, larger sample just for the map — independent of the
  // table's pagination, so the map gives a real overview instead of only
  // ever plotting whichever 25 rows the table happens to be showing.
  useEffect(() => {
    if (!accessToken) return;
    getLoginActivity(accessToken, 1, MAP_SAMPLE_SIZE)
      .then((res) => setMapActivities(res.data))
      .catch(() => undefined);
  }, [accessToken]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Login Activity</h1>
        <p className="mt-1 text-sm text-muted">
          Audit trail of every customer and admin sign-in — {result?.meta.total ?? 0} recorded.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            Approximate (IP address)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            Precise (GPS)
          </span>
        </div>
        <LoginActivityMap activities={mapActivities} />
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
