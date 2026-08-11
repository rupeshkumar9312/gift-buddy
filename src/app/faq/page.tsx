import type { Metadata } from "next";
import { PageBanner } from "@/components/PageBanner";
import { SectionHeading } from "@/components/SectionHeading";
import { FaqAccordion } from "@/components/FaqAccordion";

export const metadata: Metadata = { title: "FAQ — GiftBuddy" };

const shippingFaqs = [
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 3-5 business days. Orders over $99 ship free; expedited options are available at checkout.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to most countries. International delivery times vary between 7-14 business days depending on destination.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Absolutely — once your order ships you'll receive a tracking link by email, or you can check status on our Track Orders page.",
  },
];

const returnsFaqs = [
  {
    question: "What is your return policy?",
    answer:
      "We accept returns within 30 days of delivery for unused items in original packaging. Personalised gifts are final sale.",
  },
  {
    question: "How do I start a return?",
    answer:
      "Reach out from the Contact page with your order number and we'll email you a prepaid return label.",
  },
];

const orderFaqs = [
  {
    question: "Can I change or cancel my order?",
    answer:
      "Orders can be changed or cancelled within 1 hour of placing them. After that, we've usually started packing.",
  },
  {
    question: "Do you offer gift wrapping?",
    answer:
      "Yes! Add gift wrapping at checkout for a small fee and we'll include a handwritten note card.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PageBanner title="Frequently Asked Questions" crumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />

      <div className="container-page flex flex-col gap-16 py-14">
        <div>
          <SectionHeading eyebrow="Shipping" title="Shipping & Delivery" align="left" />
          <div className="mt-8">
            <FaqAccordion items={shippingFaqs} />
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Returns" title="Returns & Refunds" align="left" />
          <div className="mt-8">
            <FaqAccordion items={returnsFaqs} />
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Orders" title="Orders & Gifting" align="left" />
          <div className="mt-8">
            <FaqAccordion items={orderFaqs} />
          </div>
        </div>
      </div>
    </>
  );
}
