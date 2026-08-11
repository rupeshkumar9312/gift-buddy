import Image from "next/image";
import Link from "next/link";

export function UnderPriceBanner() {
  return (
    <section className="container-page py-8">
      <div className="relative flex min-h-[280px] items-center overflow-hidden rounded-3xl bg-secondary">
        <Image
          src="https://picsum.photos/seed/under-price/1600/500"
          alt="Gifts under $19.99"
          fill
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="relative z-10 mx-auto text-center">
          <p className="font-script text-3xl text-primary">amazing gifts</p>
          <h3 className="mt-1 text-3xl font-medium text-ink sm:text-4xl">
            Shop Online Gifts Under <span className="text-primary">$19.99</span>
          </h3>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-full bg-ink px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
