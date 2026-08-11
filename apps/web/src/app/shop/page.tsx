import { Suspense } from "react";
import type { Metadata } from "next";
import { PageBanner } from "@/components/PageBanner";
import { ShopPageClient } from "./ShopPageClient";

export const metadata: Metadata = { title: "Shop — GiftBuddy" };

export default function ShopPage() {
  return (
    <>
      <PageBanner title="Shop" crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <Suspense fallback={null}>
        <ShopPageClient />
      </Suspense>
    </>
  );
}
