import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { footerInfoLinks, footerServiceLinks } from "@/lib/nav";
import { FacebookIcon, InstagramIcon, PinterestIcon, TwitterIcon } from "./SocialIcons";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-cream">
      <div className="container-page grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            We promise we&rsquo;ll get back to you promptly &ndash; your gifting needs are always
            on our minds!
          </p>
          <div className="mt-4 flex items-start gap-2 text-sm text-muted">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <span>Sector 168, Noida</span>
          </div>
          {/* <div className="mt-2 flex items-start gap-2 text-sm text-muted">
            <Phone size={16} className="mt-0.5 shrink-0" />
            <span>Monday &ndash; Friday 8am &ndash; 6pm</span>
          </div> */}
          <div className="mt-5 flex items-center gap-3">
            {[FacebookIcon, InstagramIcon, TwitterIcon, PinterestIcon].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition hover:border-primary hover:text-primary"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide">Information</h3>
          <ul className="flex flex-col gap-3 text-sm text-muted">
            {footerInfoLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide">Services</h3>
          <ul className="flex flex-col gap-3 text-sm text-muted">
            {footerServiceLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide">Newsletter Sign-Up</h3>
          <p className="mb-4 text-sm text-muted">For news &amp; special offers</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} GiftBuddy. All rights reserved.</span>
          {/* <div className="flex items-center gap-4">
            <span className="opacity-70">Visa</span>
            <span className="opacity-70">Mastercard</span>
            <span className="opacity-70">PayPal</span>
            <span className="opacity-70">Apple Pay</span>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
