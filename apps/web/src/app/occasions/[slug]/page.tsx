import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getOccasion } from "@/lib/api";
import { PageBanner } from "@/components/PageBanner";
import { AuthGate } from "@/components/AuthGate";
import { ShopPageClient } from "../../shop/ShopPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const occasion = await getOccasion(slug);
  return { title: occasion ? `${occasion.name} — GiftBuddy` : "GiftBuddy" };
}

export default async function OccasionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const occasion = await getOccasion(slug);
  if (!occasion) notFound();

  // ShopPageClient's filter panel shows a product count next to each
  // category — here that's "how many of this occasion's own products are
  // in that category" rather than the category's global total. `c.slug`
  // may be either a real category (matched via p.category) or one of this
  // occasion's own tags (matched via occasionCategorySlugs).
  const categories = occasion.categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    image: "",
    count: occasion.products.filter(
      (p) => p.category === c.slug || p.occasionCategorySlugs.includes(c.slug)
    ).length,
  }));

  return (
    <>
      <PageBanner
        title={occasion.name}
        crumbs={[{ label: "Home", href: "/" }, { label: occasion.name }]}
      />

      <AuthGate
        title="Sign in to explore this occasion"
        message="Continue with Google to see the full gift collection for this occasion."
      >
        {(occasion.bannerImage || occasion.tagline || occasion.description) && (
          <div className="container-page py-10">
            <div className="mx-auto max-w-3xl text-center">
              {occasion.bannerImage && (
                <div className="relative mb-6 aspect-16/6 w-full overflow-hidden rounded-2xl bg-cream">
                  <Image
                    src={occasion.bannerImage}
                    alt={occasion.name}
                    fill
                    sizes="800px"
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              {occasion.tagline && (
                <p className="font-script text-2xl text-primary">{occasion.tagline}</p>
              )}
              {occasion.description && (
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{occasion.description}</p>
              )}
            </div>
          </div>
        )}

        <ShopPageClient categories={categories} products={occasion.products} />
      </AuthGate>
    </>
  );
}
