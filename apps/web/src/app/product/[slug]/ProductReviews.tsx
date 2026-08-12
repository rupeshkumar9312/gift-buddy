"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getProductReviews, submitReview, type Review } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { StarRating } from "@/components/StarRating";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

export function ProductReviews({
  slug,
  ratingAvg,
  ratingCount,
}: {
  slug: string;
  ratingAvg: number;
  ratingCount: number;
}) {
  const { user, accessToken } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProductReviews(slug)
      .then((result) => {
        if (!cancelled) setReviews(result.data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) return;
    setError(null);
    setSubmitting(true);
    try {
      await submitReview(slug, accessToken, { rating, title, body });
      setSubmitted(true);
      setShowForm(false);
      setTitle("");
      setBody("");
      setRating(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <StarRating rating={ratingAvg} size={16} />
          <span className="text-ink">
            {ratingAvg.toFixed(2)} out of 5 ({ratingCount} reviews)
          </span>
        </div>
        {user ? (
          !submitted && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="rounded-full border border-ink px-5 py-2 text-xs font-medium uppercase tracking-wide transition hover:border-primary hover:text-primary"
            >
              {showForm ? "Cancel" : "Write a Review"}
            </button>
          )
        ) : (
          <Link
            href="/account"
            className="text-xs font-medium uppercase tracking-wide text-primary underline underline-offset-4"
          >
            Sign in to write a review
          </Link>
        )}
      </div>

      {submitted && (
        <p className="rounded-xl bg-cream px-4 py-3 text-sm text-ink">
          Thanks! Your review has been submitted and will appear once it&rsquo;s approved.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-cream p-6">
          <div>
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink">
              Your rating
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  className="p-0.5"
                >
                  <Star
                    size={20}
                    className={value <= rating ? "fill-primary text-primary" : "fill-line text-line"}
                  />
                </button>
              ))}
            </div>
          </div>
          <input
            required
            placeholder="Review title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className={inputClass}
          />
          <textarea
            required
            placeholder="Share your thoughts about this gift"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            className={inputClass}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-fit rounded-full bg-primary px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-muted"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {isLoading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p>No written reviews yet — be the first to share your thoughts on this gift.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {reviews.map((review) => (
            <li key={review.id} className="py-5 first:pt-0">
              <div className="flex items-center gap-3">
                <StarRating rating={review.rating} size={14} />
                <span className="text-sm font-medium text-ink">{review.title}</span>
              </div>
              <p className="mt-2">{review.body}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-muted">
                {review.authorName} &middot; {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
