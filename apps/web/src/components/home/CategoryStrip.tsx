import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";
import { SectionHeading } from "@/components/SectionHeading";

export function CategoryStrip() {
  return (
    <section className="container-page py-16">
      <SectionHeading eyebrow="Browse" title="Shop by Category" />
      <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Link key={category.slug} href={`/shop?category=${category.slug}`} className="group text-center">
            <div className="relative aspect-square w-full overflow-hidden rounded-full bg-cream">
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="160px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <p className="mt-3 text-sm font-medium text-ink transition group-hover:text-primary">
              {category.name}
            </p>
            <p className="text-xs text-muted">{category.count} items</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
