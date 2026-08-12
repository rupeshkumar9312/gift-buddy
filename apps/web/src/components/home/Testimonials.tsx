import { Quote } from "lucide-react";
import { getFeaturedReviews } from "@/lib/api";
import { SectionHeading } from "@/components/SectionHeading";
import { StarRating } from "@/components/StarRating";

export async function Testimonials() {
  const reviews = await getFeaturedReviews();
  if (reviews.length === 0) return null;

  return (
    <section className="bg-cream py-16">
      <div className="container-page">
        <SectionHeading eyebrow="Testimonials" title="What Our Customers Say" />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl bg-white p-7 shadow-sm">
              <Quote size={22} className="text-secondary" />
              <p className="mt-4 text-[15px] leading-relaxed text-ink">&ldquo;{review.body}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                  {review.authorName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{review.authorName}</p>
                  <StarRating rating={review.rating} size={11} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
