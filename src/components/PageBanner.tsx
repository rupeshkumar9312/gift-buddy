import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PageBanner({
  title,
  crumbs,
}: {
  title: string;
  crumbs: { label: string; href?: string }[];
}) {
  return (
    <section className="border-b border-line bg-cream">
      <div className="container-page flex flex-col items-center gap-2 py-12 text-center">
        <h1 className="text-3xl font-medium tracking-tight text-ink sm:text-4xl">{title}</h1>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} />}
              {crumb.href ? (
                <Link href={crumb.href} className="transition hover:text-primary">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-ink">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
