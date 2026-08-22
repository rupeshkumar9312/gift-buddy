"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";
import { ProductCard } from "@/components/ProductCard";
import { Spinner } from "@/components/Spinner";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function WishlistPage() {
  const { wishlist, isWishlistLoading } = useCart();
  const { user } = useAuth();

  return (
    <>
      <PageBanner title="Wishlist" crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />

      <div className="container-page py-14">
        {!user && wishlist.length > 0 && (
          <p className="mb-8 rounded-xl bg-cream px-4 py-3 text-sm text-muted">
            <Link href="/account" className="font-medium text-primary underline underline-offset-4">
              Sign in
            </Link>{" "}
            to save your wishlist across visits.
          </p>
        )}
        {isWishlistLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size={28} className="text-primary" />
          </div>
        ) : wishlist.length === 0 ? (
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
