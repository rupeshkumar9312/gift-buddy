import type { Metadata } from "next";
import { PageBanner } from "@/components/PageBanner";
import { SectionHeading } from "@/components/SectionHeading";
import { FaqAccordion } from "@/components/FaqAccordion";
import { getFaqs } from "@/lib/api";

export const metadata: Metadata = { title: "FAQ — GiftBuddy" };

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <>
      <PageBanner title="Frequently Asked Questions" crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />

      <div className="container-page flex flex-col gap-16 py-14">
        {faqs.shipping.length > 0 && (
          <div>
            <SectionHeading eyebrow="Shipping" title="Shipping & Delivery" align="left" />
            <div className="mt-8">
              <FaqAccordion items={faqs.shipping} />
            </div>
          </div>
        )}
        {faqs.returns.length > 0 && (
          <div>
            <SectionHeading eyebrow="Returns" title="Returns & Refunds" align="left" />
            <div className="mt-8">
              <FaqAccordion items={faqs.returns} />
            </div>
          </div>
        )}
        {faqs.orders.length > 0 && (
          <div>
            <SectionHeading eyebrow="Orders" title="Orders & Gifting" align="left" />
            <div className="mt-8">
              <FaqAccordion items={faqs.orders} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
