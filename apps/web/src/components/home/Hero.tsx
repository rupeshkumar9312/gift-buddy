import Image from "next/image";
import Link from "next/link";
import { getHomeHero } from "@/lib/api";

export async function Hero() {
  const hero = await getHomeHero();

  return (
    <section className="border-b border-line bg-cream">
      <div className="container-page grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-2 lg:py-0">
        <div className="order-2 lg:order-1">
          {hero.eyebrow && <p className="font-script text-4xl text-primary">{hero.eyebrow}</p>}
          <h1 className="mt-2 text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {hero.heading}
          </h1>
          {hero.description && (
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">{hero.description}</p>
          )}
          <div className="mt-8 flex items-center gap-4">
            {hero.primaryCtaLabel && hero.primaryCtaHref && (
              <Link
                href={hero.primaryCtaHref}
                className="rounded-full bg-primary px-8 py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark"
              >
                {hero.primaryCtaLabel}
              </Link>
            )}
            {hero.secondaryCtaLabel && hero.secondaryCtaHref && (
              <Link
                href={hero.secondaryCtaHref}
                className="text-sm font-medium uppercase tracking-wide text-ink underline-offset-4 transition hover:text-primary hover:underline"
              >
                {hero.secondaryCtaLabel}
              </Link>
            )}
          </div>
        </div>
        {hero.bannerImage && (
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl lg:aspect-[5/4]">
              <Image
                src={hero.bannerImage}
                alt={hero.heading}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
