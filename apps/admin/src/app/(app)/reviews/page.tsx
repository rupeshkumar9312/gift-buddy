"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getReviews, updateReview, type AdminReview, type Paginated } from "@/lib/api";
import { formatDate } from "@/lib/format";

const TABS = [
  { key: "pending", label: "Pending", isApproved: false },
  { key: "approved", label: "Approved", isApproved: true },
] as const;

export default function ReviewsPage() {
  const { accessToken } = useAdminAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("pending");
  const [result, setResult] = useState<Paginated<AdminReview> | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = () => {
    if (!accessToken) return;
    const isApproved = TABS.find((t) => t.key === tab)!.isApproved;
    getReviews(accessToken, { isApproved })
      .then(setResult)
      .catch(() => undefined);
  };

  useEffect(load, [accessToken, tab]);

  const handleApprove = async (review: AdminReview, isApproved: boolean) => {
    if (!accessToken) return;
    setBusyId(review.id);
    try {
      await updateReview(accessToken, review.id, { isApproved });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't update this review.");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleFeatured = async (review: AdminReview) => {
    if (!accessToken) return;
    setBusyId(review.id);
    try {
      await updateReview(accessToken, review.id, { isFeatured: !review.isFeatured });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't update this review.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Reviews</h1>
        <p className="mt-1 text-sm text-muted">
          Approve customer reviews and feature the best ones as storefront testimonials.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === t.key ? "bg-primary text-white" : "border border-line text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {result?.data.map((review) => (
          <div key={review.id} className="rounded-2xl border border-line bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < review.rating ? "fill-primary text-primary" : "fill-line text-line"}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-ink">{review.title}</span>
                </div>
                <p className="mt-2 max-w-2xl text-sm text-muted">{review.body}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-muted">
                  {review.authorName} &middot; {review.productName} &middot; {formatDate(review.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {!review.isApproved ? (
                  <button
                    disabled={busyId === review.id}
                    onClick={() => handleApprove(review, true)}
                    className="rounded-full bg-primary px-4 py-2 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:opacity-60"
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    disabled={busyId === review.id}
                    onClick={() => handleApprove(review, false)}
                    className="rounded-full border border-line px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted transition hover:border-primary hover:text-primary disabled:opacity-60"
                  >
                    Unapprove
                  </button>
                )}
                <button
                  disabled={busyId === review.id}
                  onClick={() => handleToggleFeatured(review)}
                  className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-wide transition disabled:opacity-60 ${
                    review.isFeatured
                      ? "border-primary bg-cream text-primary"
                      : "border-line text-muted hover:border-primary hover:text-primary"
                  }`}
                >
                  {review.isFeatured ? "Featured ★" : "Feature"}
                </button>
              </div>
            </div>
          </div>
        ))}
        {result?.data.length === 0 && (
          <p className="rounded-2xl border border-line bg-white px-5 py-8 text-center text-sm text-muted">
            No {tab} reviews.
          </p>
        )}
      </div>
    </div>
  );
}
