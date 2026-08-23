import type { Metadata } from "next";
import Image from "next/image";
import { Gift, Headset, Truck } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = { title: "About Us — GiftBuddy" };

const team = [
  {
    name: "Hannah Vaughn",
    role: "Founder & Curator",
    avatar: "https://picsum.photos/seed/team-1/300/300",
  },
  {
    name: "Marcus Lee",
    role: "Head of Sourcing",
    avatar: "https://picsum.photos/seed/team-2/300/300",
  },
  {
    name: "Priya Nair",
    role: "Customer Experience",
    avatar: "https://picsum.photos/seed/team-3/300/300",
  },
  {
    name: "Owen Clarke",
    role: "Design Lead",
    avatar: "https://picsum.photos/seed/team-4/300/300",
  },
];

const values = [
  {
    icon: Gift,
    title: "Thoughtfully curated",
    text: "Every product is hand-picked for quality and character.",
  },
  {
    icon: Truck,
    title: "Reliable delivery",
    text: "Fast, careful shipping so gifts arrive exactly as intended.",
  },
  {
    icon: Headset,
    title: "Real support",
    text: "A team that actually answers, before and after you order.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageBanner
        title="About Us"
        crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
      />

      <section className="container-page grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
          <Image
            src="https://picsum.photos/seed/about-story/1000/800"
            alt="Our story"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="font-script text-3xl text-primary">Our Story</p>
          <h2 className="mt-1 text-3xl font-medium tracking-tight sm:text-4xl">
            Gifting made personal, again
          </h2>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
            GiftBuddy started as a small stall of hand-picked keepsakes and grew
            into a home for thoughtful, well-made gifts. We work with
            independent makers and trusted brands to bring you pieces with real
            character &mdash; the kind of gift people remember who it came from.
          </p>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
            Every order is packed with care because we believe the unboxing is
            part of the gift too.
          </p>
        </div>
      </section>

      <section className="border-y border-line bg-cream py-16">
        <div className="container-page grid grid-cols-1 gap-8 sm:grid-cols-3">
          {values.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl bg-white p-7 text-center shadow-sm"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 text-base font-medium">{title}</h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* <section className="container-page py-16">
        <SectionHeading eyebrow="Meet Us" title="Our Team" />
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {team.map((member) => (
            <div key={member.name} className="text-center">
              <div className="relative mx-auto aspect-square w-full max-w-[160px] overflow-hidden rounded-full">
                <Image src={member.avatar} alt={member.name} fill sizes="160px" className="object-cover" />
              </div>
              <p className="mt-3 text-sm font-medium">{member.name}</p>
              <p className="text-xs text-muted">{member.role}</p>
            </div>
          ))}
        </div>
      </section> */}
    </>
  );
}
