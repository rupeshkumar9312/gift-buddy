"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, DollarSign, Package, ShoppingBag } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getDashboard, type DashboardSummary } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

export default function DashboardPage() {
  const { accessToken } = useAdminAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getDashboard(accessToken)
      .then(setSummary)
      .catch(() => undefined);
  }, [accessToken]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Store performance at a glance.</p>
      </div>

      {!summary ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile
              icon={DollarSign}
              label="Revenue (paid+)"
              value={formatMoney(summary.revenue)}
            />
            <StatTile icon={ShoppingBag} label="Orders (paid+)" value={String(summary.orderCount)} />
            <StatTile
              icon={Package}
              label="Average Order Value"
              value={formatMoney(summary.averageOrderValue)}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-line bg-white p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                Recent Orders
              </h2>
              {summary.recentOrders.length === 0 ? (
                <p className="mt-4 text-sm text-muted">No orders yet.</p>
              ) : (
                <ul className="mt-4 flex flex-col divide-y divide-line">
                  {summary.recentOrders.map((order) => (
                    <li key={order.orderNumber} className="flex items-center justify-between py-3 text-sm">
                      <div>
                        <p className="font-medium text-ink">{order.orderNumber}</p>
                        <p className="text-xs text-muted">
                          {order.email} · {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <span className="font-medium text-ink">
                          {formatMoney(order.total, order.currency)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/orders"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                View all orders →
              </Link>
            </section>

            <section className="rounded-2xl border border-line bg-white p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
                <AlertTriangle size={14} className="text-primary" />
                Low Stock
              </h2>
              {summary.lowStockProducts.length === 0 ? (
                <p className="mt-4 text-sm text-muted">Everything is well stocked.</p>
              ) : (
                <ul className="mt-4 flex flex-col divide-y divide-line">
                  {summary.lowStockProducts.map((product) => (
                    <li key={product.id} className="flex items-center justify-between py-3 text-sm">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-medium text-ink hover:text-primary"
                      >
                        {product.name}
                      </Link>
                      <span
                        className={`text-xs font-medium ${
                          product.stockQty === 0 ? "text-primary" : "text-muted"
                        }`}
                      >
                        {product.stockQty === 0 ? "Out of stock" : `${product.stockQty} left`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/products"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                Manage products →
              </Link>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <Icon size={14} className="text-primary" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
