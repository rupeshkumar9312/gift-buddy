import Image from "next/image";
import Link from "next/link";

export function SaleBanners() {
  return (
    <section className="container-page grid grid-cols-1 gap-6 py-8 lg:grid-cols-2">
      <div className="relative flex min-h-[260px] items-end overflow-hidden rounded-3xl bg-ink text-white">
        <Image
          src="https://picsum.photos/seed/womens-day/900/600"
          alt="Women's Day sale"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover opacity-60"
        />
        <div className="relative z-10 p-8">
          <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-medium uppercase tracking-wide">
            Sale 50% Off
          </span>
          <h3 className="font-script mt-3 text-4xl">Women&rsquo;s Day</h3>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-full bg-white px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-ink transition hover:bg-primary hover:text-white"
          >
            Shop Now
          </Link>
        </div>
      </div>

      <div className="relative flex min-h-[260px] items-end overflow-hidden rounded-3xl bg-primary text-white">
        <Image
          src="https://picsum.photos/seed/holiday-offers/900/600"
          alt="Holiday offers"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover opacity-50"
        />
        <div className="relative z-10 p-8">
          <h3 className="text-2xl font-medium">Holiday Offers</h3>
          <p className="mt-1 text-lg">Sale 50% Off</p>
          <p className="mt-1 text-sm tracking-wide opacity-90">Code: GRS18</p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-full bg-white px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-primary transition hover:bg-ink hover:text-white"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
