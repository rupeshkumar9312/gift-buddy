import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="border-b border-line bg-cream">
      <div className="container-page grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-2 lg:py-0">
        <div className="order-2 lg:order-1">
          <p className="font-script text-4xl text-primary">Unique Gifts</p>
          <h1 className="mt-2 text-4xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            for Every Occasion
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
            Delivering quality gifts, curated collections and personalised keepsakes &mdash;
            everything you need to make someone smile.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/shop"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark"
            >
              Shop Now
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium uppercase tracking-wide text-ink underline-offset-4 transition hover:text-primary hover:underline"
            >
              Our Story
            </Link>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl lg:aspect-[5/4]">
            <Image
              src="https://picsum.photos/seed/hero-gift/1200/960"
              alt="Curated gift collection"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
