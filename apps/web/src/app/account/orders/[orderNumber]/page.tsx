"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageBanner } from "@/components/PageBanner";
import { useAuth } from "@/context/AuthContext";
import { getOrder, type OrderDetail } from "@/lib/api";
import { formatMoney } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  fulfilled: "Fulfilled",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  const { accessToken, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    getOrder(accessToken, orderNumber)
      .then(setOrder)
      .catch(() => setError(true));
  }, [accessToken, orderNumber]);

  return (
    <>
      <PageBanner
        title={`Order ${orderNumber}`}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "My Account", href: "/account" },
          { label: "Order History", href: "/account/orders" },
          { label: orderNumber },
        ]}
      />

      <div className="container-page py-14">
        {authLoading || (!order && !error) ? (
          <p className="py-10 text-center text-sm text-muted">Loading…</p>
        ) : error || !order ? (
          <p className="py-10 text-center text-sm text-muted">
            We couldn&rsquo;t find that order.{" "}
            <Link href="/account/orders" className="text-primary underline underline-offset-4">
              Back to order history
            </Link>
          </p>
        ) : (
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="rounded-2xl border border-line bg-white p-6">
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <span className="text-sm text-muted">Status</span>
                  <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>
                <ul className="mt-4 flex flex-col gap-4">
                  {order.items.map((item) => (
                    <li key={item.sku} className="flex items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                        {item.productImage && (
                          <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="64px" />
                        )}
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-ink">{item.productName}</p>
                        <p className="text-muted">
                          Qty {item.quantity} · {formatMoney(item.unitPrice)} each
                        </p>
                      </div>
                      <span className="text-sm font-medium text-ink">{formatMoney(item.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 rounded-2xl border border-line bg-white p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Order Timeline</h3>
                <ul className="mt-4 flex flex-col gap-3 text-sm">
                  {order.statusHistory.map((event, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span className="text-ink">{STATUS_LABEL[event.toStatus] ?? event.toStatus}</span>
                      <span className="text-muted">{new Date(event.createdAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="h-fit rounded-2xl bg-cream p-6 text-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Shipping Address</h3>
              <p className="mt-2 text-ink">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                <br />
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? <>, {order.shippingAddress.line2}</> : null}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.region} {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </p>

              <div className="mt-6 flex flex-col gap-2 border-t border-line pt-4">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="text-ink">{formatMoney(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping ({order.shippingMethodName})</span>
                  <span className="text-ink">{formatMoney(order.shippingTotal)}</span>
                </div>
                <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-ink">
                  <span>Total</span>
                  <span>{formatMoney(order.total, order.currency)}</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
