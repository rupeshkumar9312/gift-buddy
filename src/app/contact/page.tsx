"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

export default function ContactPage() {
  return (
    <>
      <PageBanner title="Contact Us" crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

      <div className="container-page py-14">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <h2 className="text-2xl font-medium">Get In Touch</h2>
            <p className="max-w-md text-sm text-muted">
              We promise we&rsquo;ll get back to you promptly &ndash; your gifting needs are
              always on our minds!
            </p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input required placeholder="Your name" className={inputClass} />
              <input required type="email" placeholder="Your email" className={inputClass} />
            </div>
            <input placeholder="Subject" className={inputClass} />
            <textarea required placeholder="Your message" rows={6} className={inputClass} />
            <button
              type="submit"
              className="mt-2 w-fit rounded-full bg-primary px-8 py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark"
            >
              Send Message
            </button>
          </form>

          <aside className="flex flex-col gap-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-cream">
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
                Map placeholder
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-cream p-5">
              <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-ink">Our Store</p>
                <p className="text-sm text-muted">46 Kingston Ave, Queensbury</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-cream p-5">
              <Phone size={18} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-ink">Phone</p>
                <p className="text-sm text-muted">012 - 345 - 6789</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-cream p-5">
              <Mail size={18} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-ink">Email</p>
                <p className="text-sm text-muted">hello@giftbuddy.com</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
