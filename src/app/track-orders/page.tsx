"use client";

import { Package } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";

export default function TrackOrdersPage() {
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

          <form className="mt-8 flex flex-col gap-4 text-left" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="mb-1.5 block text-sm text-muted">Order ID</label>
              <input
                required
                placeholder="e.g. GFY-10234"
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted">Billing email</label>
              <input
                required
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="mt-2 rounded-full bg-primary py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark"
            >
              Track Order
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
