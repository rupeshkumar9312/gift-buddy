"use client";

import Image from "next/image";
import { useState } from "react";
import { PageBanner } from "@/components/PageBanner";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { lines, subtotal } = useCart();
  const [payment, setPayment] = useState<"card" | "paypal" | "cod">("card");
  const shipping = subtotal >= 99 || subtotal === 0 ? 0 : 8;

  const inputClass =
    "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <>
      <PageBanner
        title="Checkout"
        crumbs={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]}
      />

      <form className="container-page py-14" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]">
          <div className="flex flex-col gap-10">
            <div>
              <h2 className="text-lg font-medium">Billing Details</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input required placeholder="First name" className={inputClass} />
                <input required placeholder="Last name" className={inputClass} />
                <input required type="email" placeholder="Email address" className={`sm:col-span-2 ${inputClass}`} />
                <input required placeholder="Phone" className={inputClass} />
                <input placeholder="Company (optional)" className={inputClass} />
                <input required placeholder="Street address" className={`sm:col-span-2 ${inputClass}`} />
                <input required placeholder="City" className={inputClass} />
                <input required placeholder="ZIP / Postal code" className={inputClass} />
                <input required placeholder="Country" className={`sm:col-span-2 ${inputClass}`} />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium">Payment Method</h2>
              <div className="mt-5 flex flex-col gap-3">
                {(
                  [
                    ["card", "Credit / Debit Card"],
                    ["paypal", "PayPal"],
                    ["cod", "Cash on Delivery"],
                  ] as [typeof payment, string][]
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-sm transition ${
                      payment === value ? "border-primary bg-cream" : "border-line"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={payment === value}
                      onChange={() => setPayment(value)}
                      className="h-4 w-4 accent-[#be7374]"
                    />
                    {label}
                  </label>
                ))}
              </div>

              {payment === "card" && (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input placeholder="Card number" className={`sm:col-span-2 ${inputClass}`} />
                  <input placeholder="MM / YY" className={inputClass} />
                  <input placeholder="CVC" className={inputClass} />
                </div>
              )}
            </div>
          </div>

          <aside className="h-fit rounded-2xl bg-cream p-7">
            <h2 className="text-lg font-medium">Your Order</h2>
            <ul className="mt-5 flex flex-col gap-4">
              {lines.length === 0 ? (
                <p className="text-sm text-muted">Your cart is empty.</p>
              ) : (
                lines.map(({ product, quantity }) => (
                  <li key={product.slug} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                      <Image src={product.image} alt={product.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-ink">{product.name}</p>
                      <p className="text-muted">Qty {quantity}</p>
                    </div>
                    <span className="text-sm font-medium">
                      ${((product.salePrice ?? product.price) * quantity).toFixed(2)}
                    </span>
                  </li>
                ))
              )}
            </ul>

            <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="text-ink">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="text-ink">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
                <span>Total</span>
                <span>${(subtotal + shipping).toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={lines.length === 0}
              className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-muted"
            >
              Place Order
            </button>
          </aside>
        </div>
      </form>
    </>
  );
}
