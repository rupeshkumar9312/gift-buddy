import Image from "next/image";
import Link from "next/link";

export function PromoBanners() {
  return (
    <section className="container-page grid grid-cols-1 gap-6 py-8 lg:grid-cols-2">
      <div className="relative flex min-h-[320px] items-center overflow-hidden rounded-3xl bg-secondary/60">
        <Image
          src="https://picsum.photos/seed/promo-love/900/700"
          alt="Send Your Love gift collection"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="relative z-10 mx-8 rounded-2xl bg-white/90 p-6 backdrop-blur-sm sm:mx-10">
          <p className="font-script text-2xl text-primary">New Arrivals</p>
          <h3 className="mt-1 text-2xl font-medium text-ink">Send Your Love</h3>
          <p className="mt-1 text-sm text-muted">from $29.90</p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-primary"
          >
            Send Gift
          </Link>
        </div>
      </div>

      <div className="relative flex min-h-[320px] items-center overflow-hidden rounded-3xl bg-cream">
        <Image
          src="https://picsum.photos/seed/promo-stationery/900/700"
          alt="Office and stationery collection"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="relative z-10 mx-8 rounded-2xl bg-white/90 p-6 backdrop-blur-sm sm:mx-10">
          <p className="font-script text-2xl text-primary">Stationery</p>
          <h3 className="mt-1 text-2xl font-medium text-ink">Office &amp; Stationery</h3>
          <p className="mt-1 text-sm text-muted">from $2.90</p>
          <Link
            href="/shop?category=office-stationery"
            className="mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-primary"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
