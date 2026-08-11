import Link from "next/link";
import { getFeaturedProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";

export async function FeaturedProducts() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Feature Items" title="Top Holiday Gift Ideas" />
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {featuredProducts.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
      <div className="mt-12 flex justify-center">
        <Link
          href="/shop"
          className="rounded-full border border-ink px-8 py-3 text-sm font-medium uppercase tracking-wide text-ink transition hover:border-primary hover:text-primary"
        >
          View All Products
        </Link>
      </div>
    </section>
  );
}
