import { Suspense } from "react";
import type { Metadata } from "next";
import { PageBanner } from "@/components/PageBanner";
import { getCategories, getProducts } from "@/lib/api";
import { ShopPageClient } from "./ShopPageClient";

export const metadata: Metadata = { title: "Shop — GiftBuddy" };

export default async function ShopPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts({ limit: 100 })]);

  return (
    <>
      <PageBanner title="Shop" crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <Suspense fallback={null}>
        <ShopPageClient categories={categories} products={products} />
      </Suspense>
    </>
  );
}
