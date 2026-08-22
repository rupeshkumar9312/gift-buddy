import Image from "next/image";
import Link from "next/link";
import { getGiftKits } from "@/lib/api";
import { SectionHeading } from "@/components/SectionHeading";

export async function GiftKits() {
  const kits = await getGiftKits().catch(() => []);
  if (kits.length === 0) return null;

  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Curated" title="Gift Kits &amp; Baskets" />
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kits.map((kit) => (
          <Link
            key={kit.id}
            href={kit.href}
            className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl"
          >
            {kit.image && (
              <Image
                src={kit.image}
                alt={kit.title}
                fill
                sizes="(max-width: 640px) 100vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="relative z-10 p-5 text-white">
              <h3 className="text-lg font-medium">{kit.title}</h3>
              {kit.subtitle && <p className="text-xs opacity-90">{kit.subtitle}</p>}
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
