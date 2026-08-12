"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";
import { useAuth } from "@/context/AuthContext";
import { getOrder, type OrderDetail } from "@/lib/api";

export default function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  const { user, accessToken } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getOrder(accessToken, orderNumber)
      .then(setOrder)
      .catch(() => undefined);
  }, [accessToken, orderNumber]);

  return (
    <>
      <PageBanner title="Order Confirmed" crumbs={[{ label: "Home", href: "/" }, { label: "Order Confirmed" }]} />

      <div className="container-page flex justify-center py-16">
        <div className="w-full max-w-lg text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream text-primary">
            <CheckCircle2 size={28} />
          </span>
          <h1 className="mt-5 text-2xl font-medium">Thank you for your order!</h1>
          <p className="mt-2 text-sm text-muted">
            Order <span className="font-medium text-ink">{orderNumber}</span> is confirmed. A
            receipt has been emailed to you.
          </p>

          {order && (
            <div className="mt-8 rounded-2xl border border-line bg-white p-6 text-left text-sm">
              <div className="flex justify-between border-b border-line pb-3">
                <span className="text-muted">Status</span>
                <span className="font-medium capitalize text-ink">{order.status.replace("_", " ")}</span>
              </div>
              <ul className="mt-3 flex flex-col gap-2">
                {order.items.map((item) => (
                  <li key={item.sku} className="flex justify-between">
                    <span className="text-muted">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="text-ink">${item.lineTotal.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-line pt-3 font-semibold">
                <span>Total</span>
                <span>
                  ${order.total.toFixed(2)} {order.currency.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-full border border-ink px-6 py-2.5 text-sm font-medium uppercase tracking-wide transition hover:border-primary hover:text-primary"
            >
              Continue Shopping
            </Link>
            {user ? (
              <Link
                href="/account/orders"
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark"
              >
                View Order History
              </Link>
            ) : (
              <Link
                href="/track-orders"
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark"
              >
                Track This Order
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
