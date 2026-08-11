import Image from "next/image";
import { Quote } from "lucide-react";
import { testimonials } from "@/lib/data";
import { SectionHeading } from "@/components/SectionHeading";
import { StarRating } from "@/components/StarRating";

export function Testimonials() {
  return (
    <section className="bg-cream py-16">
      <div className="container-page">
        <SectionHeading eyebrow="Testimonials" title="What Our Customers Say" />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.author} className="rounded-2xl bg-white p-7 shadow-sm">
              <Quote size={22} className="text-secondary" />
              <p className="mt-4 text-[15px] leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-full">
                  <Image src={t.avatar} alt={t.author} fill className="object-cover" sizes="44px" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{t.author}</p>
                  <StarRating rating={5} size={11} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
