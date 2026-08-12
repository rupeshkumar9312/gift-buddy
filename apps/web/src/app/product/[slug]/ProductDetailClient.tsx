"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart, Minus, Plus, RefreshCcw, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import type { Product } from "@/lib/types";
import { StarRating } from "@/components/StarRating";
import { useCart } from "@/context/CartContext";
import { ProductReviews } from "./ProductReviews";

type Tab = "description" | "info" | "reviews";

export function ProductDetailClient({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<Tab>("description");
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="container-page py-14">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-cream">
            <Image
              src={product.gallery[activeImage]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {product.badge === "sale" && (
              <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
                Sale
              </span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.gallery.map((src, i) => (
              <button
                key={src}
                onClick={() => setActiveImage(i)}
                className={`relative aspect-square overflow-hidden rounded-xl bg-cream ring-2 transition ${
                  activeImage === i ? "ring-primary" : "ring-transparent"
                }`}
              >
                <Image src={src} alt="" fill sizes="120px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {product.category.replace(/-/g, " ")}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-ink">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <StarRating rating={product.rating} />
            <span className="text-sm text-muted">
              {product.rating.toFixed(2)} out of 5 ({product.reviews} reviews)
            </span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            {product.salePrice ? (
              <>
                <span className="text-2xl font-semibold text-primary">${product.salePrice.toFixed(2)}</span>
                <span className="text-lg text-muted line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-2xl font-semibold text-ink">${product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">{product.description}</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-line">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center text-ink transition hover:text-primary"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-11 w-11 items-center justify-center text-ink transition hover:text-primary"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={() => addToCart(product, quantity)}
              disabled={!product.inStock}
              className="flex flex-1 min-w-[180px] items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-muted"
            >
              <ShoppingBag size={16} />
              {product.inStock ? "Add to Cart" : "Sold Out"}
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              aria-label="Add to wishlist"
              className={`flex h-[50px] w-[50px] items-center justify-center rounded-full border transition ${
                wishlisted ? "border-primary text-primary" : "border-line text-ink hover:border-primary hover:text-primary"
              }`}
            >
              <Heart size={17} fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-400"}`}
            />
            <span className="text-muted">{product.inStock ? "In stock" : "Out of stock"}</span>
            <span className="ml-4 text-muted">SKU: {product.sku}</span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 border-t border-line pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-2.5 text-sm text-muted">
              <Truck size={17} className="text-primary" /> Free shipping over $99
            </div>
            <div className="flex items-center gap-2.5 text-sm text-muted">
              <RefreshCcw size={17} className="text-primary" /> 30-day easy returns
            </div>
            <div className="flex items-center gap-2.5 text-sm text-muted">
              <ShieldCheck size={17} className="text-primary" /> Secure checkout
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="flex gap-8 border-b border-line">
          {(
            [
              ["description", "Description"],
              ["info", "Additional Information"],
              ["reviews", `Reviews (${product.reviews})`],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 px-1 pb-4 text-sm font-medium uppercase tracking-wide transition ${
                tab === key ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="max-w-2xl py-8 text-[15px] leading-relaxed text-muted">
          {tab === "description" && <p>{product.description}</p>}
          {tab === "info" && (
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-line">
                  <td className="py-3 pr-4 font-medium text-ink">Category</td>
                  <td className="py-3 capitalize">{product.category.replace(/-/g, " ")}</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="py-3 pr-4 font-medium text-ink">SKU</td>
                  <td className="py-3">{product.sku}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium text-ink">Availability</td>
                  <td className="py-3">{product.inStock ? "In stock" : "Out of stock"}</td>
                </tr>
              </tbody>
            </table>
          )}
          {tab === "reviews" && (
            <ProductReviews slug={product.slug} ratingAvg={product.rating} ratingCount={product.reviews} />
          )}
        </div>
      </div>
    </div>
  );
}
