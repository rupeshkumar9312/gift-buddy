"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getOrders, type AdminOrderSummary, type Paginated } from "@/lib/api";
import { formatDate, formatMoney, STATUS_LABEL } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

const STATUS_TABS = [
  "all",
  "pending_payment",
  "paid",
  "fulfilled",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
];

export default function OrdersPage() {
  const { accessToken, hasPermission } = useAdminAuth();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<AdminOrderSummary> | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getOrders(accessToken, { status: status === "all" ? undefined : status, page })
      .then(setResult)
      .catch(() => undefined);
  }, [accessToken, status, page]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="mt-1 text-sm text-muted">{result?.meta.total ?? 0} orders.</p>
        </div>
        {hasPermission("orders.write") && (
          <Link
            href="/orders/new"
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            <Plus size={15} />
            New Order
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setStatus(tab);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
              status === tab ? "bg-primary text-white" : "border border-line text-muted hover:text-ink"
            }`}
          >
            {tab === "all" ? "All" : STATUS_LABEL[tab]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {result?.data.map((order) => (
              <tr key={order.id}>
                <td className="px-5 py-3">
                  <Link href={`/orders/${order.id}`} className="font-medium text-ink hover:text-primary">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-5 py-3 text-muted">
                  {order.email}
                  {order.phone && <div className="text-xs text-muted/70">{order.phone}</div>}
                </td>
                <td className="px-5 py-3 text-muted">{formatDate(order.createdAt)}</td>
                <td className="px-5 py-3 text-muted">{order.itemCount}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} />
                    {order.paymentProvider === "cod" && (
                      <span className="text-xs font-medium uppercase tracking-wide text-muted">
                        COD
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 text-right font-medium text-ink">
                  {formatMoney(order.total, order.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {result?.data.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted">No orders in this view.</p>
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
