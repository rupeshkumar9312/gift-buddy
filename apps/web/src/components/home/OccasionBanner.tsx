import Image from "next/image";
import Link from "next/link";
import { getOccasions } from "@/lib/api";
import { SectionHeading } from "@/components/SectionHeading";

export async function OccasionBanner() {
  const occasions = await getOccasions();
  if (occasions.length === 0) return null;

  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Shop by Occasion" title="Gifts for the Moment" />
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {occasions.map((occasion) => (
          <Link
            key={occasion.slug}
            href={`/occasions/${occasion.slug}`}
            className="group relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-2xl bg-cream"
          >
            {occasion.bannerImage && (
              <Image
                src={occasion.bannerImage}
                alt={occasion.name}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="relative z-10 p-5 text-white">
              <h3 className="text-lg font-medium">{occasion.name}</h3>
              {occasion.tagline && <p className="text-xs opacity-90">{occasion.tagline}</p>}
              <span className="mt-2 inline-block text-xs font-medium uppercase tracking-wide underline underline-offset-4">
                Shop Now
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
