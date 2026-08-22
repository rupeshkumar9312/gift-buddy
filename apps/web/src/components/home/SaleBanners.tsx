import Image from "next/image";
import Link from "next/link";
import { getSaleBanners } from "@/lib/api";

export async function SaleBanners() {
  const banners = await getSaleBanners().catch(() => []);
  if (banners.length === 0) return null;

  return (
    <section className="container-page grid grid-cols-1 gap-6 py-8 lg:grid-cols-2">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="relative flex min-h-[260px] items-end overflow-hidden rounded-3xl bg-ink text-white"
        >
          {banner.image && (
            <Image
              src={banner.image}
              alt={banner.heading}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover opacity-60"
            />
          )}
          <div className="relative z-10 p-8">
            {banner.badge && (
              <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-medium uppercase tracking-wide">
                {banner.badge}
              </span>
            )}
            <h3 className="font-script mt-3 text-4xl">{banner.heading}</h3>
            {banner.subtitle && <p className="mt-1 text-lg">{banner.subtitle}</p>}
            {banner.note && (
              <p className="mt-1 text-sm tracking-wide opacity-90">{banner.note}</p>
            )}
            <Link
              href={banner.ctaHref}
              className="mt-4 inline-block rounded-full bg-white px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-ink transition hover:bg-primary hover:text-white"
            >
              {banner.ctaLabel}
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}
