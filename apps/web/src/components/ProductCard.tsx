"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/format";
import { StarRating } from "./StarRating";

const badgeStyles: Record<NonNullable<Product["badge"]>, string> = {
  sale: "bg-primary text-white",
  new: "bg-ink text-white",
  hot: "bg-secondary text-ink",
};

const badgeLabel: Record<NonNullable<Product["badge"]>, string> = {
  sale: "Sale",
  new: "New",
  hot: "Hot",
};

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-cream">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.image2 && (
            <Image
              src={product.image2}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>

        {product.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide ${badgeStyles[product.badge]}`}
          >
            {badgeLabel[product.badge]}
          </span>
        )}

        <button
          onClick={() => toggleWishlist(product)}
          aria-label="Add to wishlist"
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-primary hover:text-white ${
            wishlisted ? "text-primary" : "text-ink"
          }`}
        >
          <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex translate-y-2 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-2.5 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:bg-muted"
          >
            <ShoppingBag size={13} />
            {product.inStock ? "Add to Cart" : "Sold Out"}
          </button>
          <Link
            href={`/product/${product.slug}`}
            aria-label="Quick view"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-ink transition hover:bg-primary hover:text-white"
          >
            <Eye size={15} />
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-start gap-1.5">
        <StarRating rating={product.rating} />
        <Link
          href={`/product/${product.slug}`}
          className="text-[15px] font-medium leading-snug text-ink transition hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2 text-sm">
          {product.salePrice ? (
            <>
              <span className="font-semibold text-primary">{formatMoney(product.salePrice)}</span>
              <span className="text-muted line-through">{formatMoney(product.price)}</span>
            </>
          ) : (
            <span className="font-semibold text-ink">{formatMoney(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
