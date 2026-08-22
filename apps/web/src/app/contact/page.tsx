"use client";

import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";
import { Spinner } from "@/components/Spinner";
import { submitContact } from "@/lib/api";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await submitContact({
        name: String(form.get("name")),
        email: String(form.get("email")),
        subject: String(form.get("subject") || "") || undefined,
        message: String(form.get("message")),
      });
      setSent(true);
      e.currentTarget.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't send your message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageBanner
        title="Contact Us"
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <div className="container-page py-14">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-medium">Get In Touch</h2>
            <p className="max-w-md text-sm text-muted">
              We promise we&rsquo;ll get back to you promptly &ndash; your
              gifting needs are always on our minds!
            </p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                required
                name="name"
                placeholder="Your name"
                className={inputClass}
              />
              <input
                required
                name="email"
                type="email"
                placeholder="Your email"
                className={inputClass}
              />
            </div>
            <input
              name="subject"
              placeholder="Subject"
              className={inputClass}
            />
            <textarea
              required
              name="message"
              placeholder="Your message"
              rows={6}
              className={inputClass}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            {sent && (
              <p className="text-sm text-primary">
                Thanks for reaching out — we&rsquo;ll get back to you shortly.
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-fit items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Spinner size={16} />}
              {submitting ? "Sending…" : "Send Message"}
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
                <p className="text-sm text-muted">Sector 168, Noida</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-cream p-5">
              <Phone size={18} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-ink">Phone</p>
                <p className="text-sm text-muted">7599031402</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-cream p-5">
              <Mail size={18} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-ink">Email</p>
                <p className="text-sm text-muted">giftbuddy0210@gmail.com</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
