"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";
import { Spinner } from "@/components/Spinner";
import { cancelOrder, trackOrder, type OrderDetail } from "@/lib/api";
import { formatMoney } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  fulfilled: "Fulfilled",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const CANCELLABLE_STATUSES = ["pending_payment", "paid"];

export default function TrackOrdersPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    setOrder(null);
    setConfirmingCancel(false);
    setCancelError(null);
    try {
      const result = await trackOrder(orderNumber.trim(), email.trim());
      setOrder(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't find that order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      const updated = await cancelOrder(orderNumber.trim(), { email: email.trim() });
      setOrder(updated);
      setConfirmingCancel(false);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Couldn't cancel your order.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <PageBanner title="Track Your Order" crumbs={[{ label: "Home", href: "/" }, { label: "Track Orders" }]} />

      <div className="container-page flex justify-center py-14">
        <div className="w-full max-w-lg text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream text-primary">
            <Package size={24} />
          </span>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            To track your order, please enter your Order ID and the email address used at
            checkout below.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 text-left">
            <div>
              <label className="mb-1.5 block text-sm text-muted">Order ID</label>
              <input
                required
                placeholder="e.g. GB-20260812-1A2B3C4D"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted">Billing email</label>
              <input
                required
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            {error && (
              <p className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Spinner size={16} />}
              {submitting ? "Searching…" : "Track Order"}
            </button>
          </form>

          {order && (
            <div className="mt-8 rounded-2xl border border-line bg-white p-6 text-left text-sm">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="font-medium text-ink">{order.orderNumber}</span>
                <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>

              {CANCELLABLE_STATUSES.includes(order.status) && (
                <div className="border-b border-line py-3">
                  {cancelError && <p className="mb-2 text-xs text-primary">{cancelError}</p>}
                  {confirmingCancel ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted">Cancel this order? This can&rsquo;t be undone.</span>
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:opacity-60"
                      >
                        {cancelling && <Spinner size={12} />}
                        {cancelling ? "Cancelling…" : "Yes, cancel"}
                      </button>
                      <button
                        onClick={() => setConfirmingCancel(false)}
                        disabled={cancelling}
                        className="text-xs font-medium uppercase tracking-wide text-muted hover:text-ink"
                      >
                        Never mind
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingCancel(true)}
                      className="rounded-full border border-line px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink transition hover:border-primary hover:text-primary"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              )}

              <ul className="mt-3 flex flex-col gap-3">
                {order.items.map((item) => (
                  <li key={item.sku} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream">
                      {item.productImage && (
                        <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="48px" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-ink">{item.productName}</p>
                      <p className="text-xs text-muted">Qty {item.quantity}</p>
                    </div>
                    <span className="text-ink">{formatMoney(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-line pt-3 font-semibold">
                <span>Total</span>
                <span>{formatMoney(order.total, order.currency)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
