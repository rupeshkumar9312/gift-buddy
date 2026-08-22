"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Spinner } from "@/components/Spinner";

function PayButton({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      {error && (
        <p className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting && <Spinner size={16} />}
        {submitting ? "Confirming payment…" : "Pay Now"}
      </button>
    </form>
  );
}

export function StripePaymentForm({
  publishableKey,
  clientSecret,
  onSuccess,
}: {
  publishableKey: string;
  clientSecret: string;
  onSuccess: () => void;
}) {
  const [stripePromise] = useState(() => loadStripe(publishableKey));

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PayButton onSuccess={onSuccess} />
    </Elements>
  );
}
