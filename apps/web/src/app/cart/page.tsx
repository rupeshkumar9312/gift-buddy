"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    lines,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountTotal,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError(null);
    setApplying(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput("");
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Couldn't apply that coupon.");
    } finally {
      setApplying(false);
    }
  };

  const shippingCost = subtotal >= 99 ? 0 : 8;
  const total = Math.max(0, subtotal + shippingCost - discountTotal);

  return (
    <>
      <PageBanner title="Your Cart" crumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

      <div className="container-page py-14">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream text-primary">
              <ShoppingBag size={26} />
            </span>
            <div>
              <h2 className="text-xl font-medium">Your cart is empty</h2>
              <p className="mt-1 text-sm text-muted">Looks like you haven&rsquo;t added any gifts yet.</p>
            </div>
            <Link
              href="/shop"
              className="rounded-full bg-primary px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-line pb-4 text-xs font-semibold uppercase tracking-wide text-muted sm:grid">
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Total</span>
                <span />
              </div>
              <ul className="flex flex-col divide-y divide-line">
                {lines.map((line) => {
                  const price = line.salePrice ?? line.price;
                  return (
                    <li
                      key={line.productId}
                      className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-center"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                          {line.image && (
                            <Image src={line.image} alt={line.name} fill className="object-cover" sizes="80px" />
                          )}
                        </div>
                        <Link href={`/product/${line.slug}`} className="text-sm font-medium hover:text-primary">
                          {line.name}
                        </Link>
                      </div>
                      <span className="text-sm text-muted">${price.toFixed(2)}</span>
                      <div className="flex items-center rounded-full border border-line w-fit">
                        <button
                          onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center text-ink transition hover:text-primary"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center text-sm">{line.quantity}</span>
                        <button
                          onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                          className="flex h-9 w-9 items-center justify-center text-ink transition hover:text-primary"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-ink">${line.lineTotal.toFixed(2)}</span>
                      <button
                        onClick={() => removeFromCart(line.productId)}
                        aria-label="Remove item"
                        className="flex h-9 w-9 items-center justify-center text-muted transition hover:text-primary"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <Link
                  href="/shop"
                  className="rounded-full border border-ink px-6 py-2.5 text-sm font-medium uppercase tracking-wide transition hover:border-primary hover:text-primary"
                >
                  Continue Shopping
                </Link>
                <div className="flex flex-col items-end gap-2">
                  {couponCode ? (
                    <div className="flex items-center gap-2 rounded-full bg-cream px-4 py-2.5 text-sm">
                      <span className="font-medium text-ink">{couponCode}</span>
                      <span className="text-muted">applied</span>
                      <button
                        type="button"
                        onClick={() => removeCoupon()}
                        aria-label="Remove coupon"
                        className="text-muted transition hover:text-primary"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <form className="flex gap-2" onSubmit={handleApplyCoupon}>
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="rounded-full border border-line px-4 py-2.5 text-sm outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        disabled={applying}
                        className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {applying ? "Applying..." : "Apply"}
                      </button>
                    </form>
                  )}
                  {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                </div>
              </div>
            </div>

            <aside className="h-fit rounded-2xl bg-cream p-7">
              <h2 className="text-lg font-medium">Order Summary</h2>
              <div className="mt-5 flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="text-ink">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span className="text-ink">{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Discount{couponCode ? ` (${couponCode})` : ""}</span>
                    <span className="text-primary">-${discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-6 block rounded-full bg-primary py-3.5 text-center text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark"
              >
                Proceed to Checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
