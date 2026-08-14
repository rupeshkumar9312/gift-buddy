"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/format";

export function CartDrawer() {
  const { isCartOpen, closeCart, lines, removeFromCart, updateQuantity, subtotal } = useCart();

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${
          isCartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="text-lg font-medium">Your Cart ({lines.length})</h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-cream"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted">
              <p>Your cart is empty.</p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {lines.map((line) => (
                <li key={line.productId} className="flex gap-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-cream">
                    {line.image && (
                      <Image src={line.image} alt={line.name} fill className="object-cover" sizes="80px" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${line.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium leading-snug hover:text-primary"
                      >
                        {line.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(line.productId)}
                        aria-label="Remove item"
                        className="text-muted transition hover:text-primary"
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-line">
                        <button
                          onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-ink transition hover:text-primary"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm">{line.quantity}</span>
                        <button
                          onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-ink transition hover:text-primary"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-primary">{formatMoney(line.lineTotal)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-line px-6 py-5">
            <div className="mb-4 flex items-center justify-between text-base">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold text-ink">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/cart"
                onClick={closeCart}
                className="rounded-full border border-ink px-5 py-3 text-center text-sm font-medium tracking-wide transition hover:border-primary hover:text-primary"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="rounded-full bg-primary px-5 py-3 text-center text-sm font-medium tracking-wide text-white transition hover:bg-primary-dark"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
