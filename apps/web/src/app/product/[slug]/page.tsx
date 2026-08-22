import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/api";
import { PageBanner } from "@/components/PageBanner";
import { AuthGate } from "@/components/AuthGate";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductDetailClient } from "./ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.name} — GiftBuddy` : "Product — GiftBuddy" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.slug);

  return (
    <>
      <PageBanner
        title={product.name}
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: product.name }]}
      />
      <AuthGate
        title="Sign in to view this gift"
        message="Continue with Google to see full details, pricing, and add it to your cart."
      >
        <ProductDetailClient product={product} />

        {related.length > 0 && (
          <section className="container-page border-t border-line py-16">
            <SectionHeading eyebrow="You May Also Like" title="Related Gifts" />
            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </AuthGate>
    </>
  );
}
