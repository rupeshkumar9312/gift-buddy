"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  deleteOutOfAreaOrder,
  getOutOfAreaOrders,
  type OutOfAreaOrder,
} from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

export default function OutOfAreaOrdersPage() {
  const { accessToken, hasPermission } = useAdminAuth();
  const canWrite = hasPermission("orders.write");
  const [orders, setOrders] = useState<OutOfAreaOrder[] | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = () => {
    if (!accessToken) return;
    getOutOfAreaOrders(accessToken)
      .then(setOrders)
      .catch(() => undefined);
  };

  useEffect(load, [accessToken]);

  const handleDelete = async (order: OutOfAreaOrder) => {
    if (!accessToken) return;
    if (!confirm(`Delete this request from ${order.address.firstName} ${order.address.lastName}?`)) return;
    try {
      await deleteOutOfAreaOrder(accessToken, order.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't delete this request.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Out-of-Area Requests</h1>
        <p className="mt-1 text-sm text-muted">
          Checkout attempts from societies we don&apos;t serve yet. Nothing here has
          been charged or fulfilled — reach out once you expand to that area.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {orders?.map((order) => (
          <div key={order.id} className="rounded-2xl border border-line bg-white">
            <button
              onClick={() => setOpenId(openId === order.id ? null : order.id)}
              className="flex w-full flex-wrap items-center justify-between gap-3 px-6 py-4 text-left"
            >
              <div>
                <p className="text-sm font-medium text-ink">
                  {order.address.firstName} {order.address.lastName} &middot;{" "}
                  <span className="font-normal text-muted">{order.address.line2}</span>
                </p>
                <p className="text-xs text-muted">
                  {order.email} &middot; {formatDate(order.createdAt)}
                </p>
              </div>
              <span className="text-sm font-medium text-ink">
                {formatMoney(Number(order.subtotal))}
              </span>
            </button>
            {openId === order.id && (
              <div className="border-t border-line px-6 py-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Address
                    </p>
                    <p className="mt-2 text-sm text-ink">
                      {order.address.line1}
                      <br />
                      {order.address.line2}
                      <br />
                      {order.address.city}, {order.address.region}{" "}
                      {order.address.postalCode}
                      <br />
                      {order.address.country}
                      {order.address.phone && (
                        <>
                          <br />
                          {order.address.phone}
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Items
                    </p>
                    <ul className="mt-2 flex flex-col gap-1 text-sm text-ink">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between gap-4">
                          <span>
                            {item.name} &times; {item.quantity}
                          </span>
                          <span className="text-muted">{formatMoney(item.lineTotal)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {canWrite && (
                  <button
                    onClick={() => handleDelete(order)}
                    className="mt-4 flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted transition hover:bg-cream hover:text-primary"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {orders?.length === 0 && (
          <p className="rounded-2xl border border-line bg-white px-5 py-8 text-center text-sm text-muted">
            No out-of-area requests yet.
          </p>
        )}
      </div>
    </div>
  );
}
