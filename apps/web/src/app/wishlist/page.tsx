"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { wishlist } = useCart();

  return (
    <>
      <PageBanner title="Wishlist" crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />

      <div className="container-page py-14">
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream text-primary">
              <Heart size={26} />
            </span>
            <div>
              <h2 className="text-xl font-medium">Your wishlist is empty</h2>
              <p className="mt-1 text-sm text-muted">Save gifts you love to find them here later.</p>
            </div>
            <Link
              href="/shop"
              className="rounded-full bg-primary px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark"
            >
              Browse Gifts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {wishlist.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
