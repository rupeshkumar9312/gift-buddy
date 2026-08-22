import { Suspense } from "react";
import type { Metadata } from "next";
import { PageBanner } from "@/components/PageBanner";
import { AuthGate } from "@/components/AuthGate";
import { getCategories, getProducts } from "@/lib/api";
import { ShopPageClient } from "./ShopPageClient";

export const metadata: Metadata = { title: "Shop — GiftBuddy" };

export default async function ShopPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts({ limit: 100 })]);

  return (
    <>
      <PageBanner title="Shop" crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <AuthGate
        title="Sign in to browse our gifts"
        message="Continue with Google to explore the full collection — no forms to fill out."
      >
        <Suspense fallback={null}>
          <ShopPageClient categories={categories} products={products} />
        </Suspense>
      </AuthGate>
    </>
  );
}
