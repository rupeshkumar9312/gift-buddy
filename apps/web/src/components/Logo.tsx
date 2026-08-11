import Link from "next/link";
import { Gift } from "lucide-react";

export function Logo({
  className = "",
  showTagline = true,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        <Gift size={18} strokeWidth={2.25} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[24px] font-semibold tracking-tight text-ink">
          Gift<span className="text-primary">Buddy</span>
        </span>
        {showTagline && (
          <span className="mt-1 hidden whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.18em] text-muted sm:block">
            Your Gifting Partner
          </span>
        )}
      </span>
    </Link>
  );
}
