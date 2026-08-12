"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getOrder, updateOrderStatus, type AdminOrderDetail } from "@/lib/api";
import { formatMoney, STATUS_LABEL } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

const NEXT_STATUS_OPTIONS: Record<string, string[]> = {
  pending_payment: [],
  paid: ["fulfilled", "cancelled", "refunded"],
  fulfilled: ["completed", "refunded"],
  completed: ["refunded"],
  cancelled: [],
  refunded: [],
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const orderId = Number(id);
  const { accessToken, hasPermission } = useAdminAuth();
  const canWrite = hasPermission("orders.write");
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!accessToken) return;
    getOrder(accessToken, orderId)
      .then(setOrder)
      .catch(() => undefined);
  };

  useEffect(load, [accessToken, orderId]);

  const handleStatusChange = async (status: string) => {
    if (!accessToken) return;
    setError(null);
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(accessToken, orderId, status, note || undefined);
      setOrder(updated);
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the order.");
    } finally {
      setUpdating(false);
    }
  };

  if (!order) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  const nextOptions = NEXT_STATUS_OPTIONS[order.status] ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted">{order.email}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Items</h2>
            <ul className="mt-4 flex flex-col divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.sku} className="flex items-center gap-4 py-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream">
                    {item.productImage && (
                      <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="56px" />
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-ink">{item.productName}</p>
                    <p className="text-muted">
                      Qty {item.quantity} · {formatMoney(item.unitPrice, order.currency)} each
                    </p>
                  </div>
                  <span className="text-sm font-medium text-ink">
                    {formatMoney(item.lineTotal, order.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Timeline</h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              {order.statusHistory.map((event, index) => (
                <li key={index} className="flex flex-col gap-0.5 border-l-2 border-line pl-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink">{STATUS_LABEL[event.toStatus] ?? event.toStatus}</span>
                    <span className="text-xs text-muted">{new Date(event.createdAt).toLocaleString()}</span>
                  </div>
                  {event.note && <span className="text-xs text-muted">{event.note}</span>}
                </li>
              ))}
            </ul>
          </section>

          {canWrite && nextOptions.length > 0 && (
            <section className="rounded-2xl border border-line bg-white p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Update Status</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note (e.g. tracking number)"
                rows={2}
                className="mt-3 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
              {error && <p className="mt-2 text-sm text-primary">{error}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {nextOptions.map((status) => (
                  <button
                    key={status}
                    disabled={updating}
                    onClick={() => handleStatusChange(status)}
                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
                  >
                    Mark as {STATUS_LABEL[status]}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="flex h-fit flex-col gap-6">
          <section className="rounded-2xl border border-line bg-white p-6 text-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Shipping Address</h2>
            <p className="mt-3 text-ink">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? <>, {order.shippingAddress.line2}</> : null}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.region} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6 text-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Summary</h2>
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="text-ink">{formatMoney(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping ({order.shippingMethodName})</span>
                <span className="text-ink">{formatMoney(order.shippingTotal, order.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-ink">
                <span>Total</span>
                <span>{formatMoney(order.total, order.currency)}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
