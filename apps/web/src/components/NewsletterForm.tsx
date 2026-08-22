"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/lib/api";
import { Spinner } from "./Spinner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await subscribeNewsletter(email);
      setSubscribed(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (subscribed) {
    return <p className="text-sm text-primary">You&rsquo;re subscribed — thanks for joining!</p>;
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full min-w-0 rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={submitting}
          className="flex shrink-0 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Spinner size={14} /> : "Join"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
