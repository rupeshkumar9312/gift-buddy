import Image from "next/image";
import Link from "next/link";
import { getPromoBanners } from "@/lib/api";

export async function PromoBanners() {
  const banners = await getPromoBanners().catch(() => []);
  if (banners.length === 0) return null;

  return (
    <section className="container-page grid grid-cols-1 gap-6 py-8 lg:grid-cols-2">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="relative flex min-h-[320px] items-center overflow-hidden rounded-3xl bg-secondary/60"
        >
          {banner.image && (
            <Image
              src={banner.image}
              alt={banner.heading}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          )}
          <div className="relative z-10 mx-8 rounded-2xl bg-white/90 p-6 backdrop-blur-sm sm:mx-10">
            {banner.eyebrow && (
              <p className="font-script text-2xl text-primary">{banner.eyebrow}</p>
            )}
            <h3 className="mt-1 text-2xl font-medium text-ink">{banner.heading}</h3>
            {banner.subtitle && (
              <p className="mt-1 text-sm text-muted">{banner.subtitle}</p>
            )}
            <Link
              href={banner.ctaHref}
              className="mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-primary"
            >
              {banner.ctaLabel}
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}
