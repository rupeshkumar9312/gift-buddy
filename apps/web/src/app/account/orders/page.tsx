"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";
import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/context/AuthContext";
import { getOrders, type OrderSummary } from "@/lib/api";
import { formatMoney } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  fulfilled: "Fulfilled",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function OrderHistoryPage() {
  const { user, accessToken, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getOrders(accessToken)
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]));
  }, [accessToken]);

  return (
    <>
      <PageBanner
        title="Order History"
        crumbs={[{ label: "Home", href: "/" }, { label: "My Account", href: "/account" }, { label: "Order History" }]}
      />

      <div className="container-page py-14">
        {authLoading || (accessToken && orders === null) ? (
          <div className="flex justify-center py-16">
            <Spinner size={26} className="text-primary" />
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-sm text-muted">Sign in to view your order history.</p>
            <Link
              href="/account"
              className="rounded-full bg-primary px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark"
            >
              Go to Sign In
            </Link>
          </div>
        ) : orders && orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-primary">
              <PackageSearch size={24} />
            </span>
            <p className="text-sm text-muted">You haven&rsquo;t placed any orders yet.</p>
            <Link
              href="/shop"
              className="rounded-full bg-primary px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders?.map((order) => (
                  <tr key={order.orderNumber}>
                    <td className="py-4">
                      <Link
                        href={`/account/orders/${order.orderNumber}`}
                        className="font-medium text-ink hover:text-primary"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-4 text-muted">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-muted">{STATUS_LABEL[order.status] ?? order.status}</td>
                    <td className="py-4 text-muted">{order.itemCount}</td>
                    <td className="py-4 text-right font-medium text-ink">
                      {formatMoney(order.total, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
