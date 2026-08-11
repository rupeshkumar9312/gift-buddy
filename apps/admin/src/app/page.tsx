import { Gift } from "lucide-react";
import { ApiStatus } from "@/components/ApiStatus";

const phases = [
  { phase: "Phase 0", label: "Infra & scaffolding", done: true },
  { phase: "Phase 1", label: "Identity & catalog (read path)", done: false },
  { phase: "Phase 2", label: "Cart, checkout & payments", done: false },
  { phase: "Phase 3", label: "Admin panel core — this app goes live", done: false },
];

export default function AdminHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
          <Gift size={19} strokeWidth={2.25} />
        </span>
        <span className="text-2xl font-semibold tracking-tight text-ink">
          GiftBuddy <span className="text-primary">Admin</span>
        </span>
      </div>

      <p className="max-w-md text-center text-sm leading-relaxed text-muted">
        This is a Phase 0 scaffold — the console for running the GiftBuddy store day to day.
        Catalog, orders, and customer management land in Phase 3 of the delivery roadmap.
      </p>

      <ApiStatus />

      <ol className="flex w-full max-w-xs flex-col gap-2.5 rounded-2xl border border-line bg-white p-5">
        {phases.map((p) => (
          <li key={p.phase} className="flex items-center gap-3 text-sm">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                p.done ? "bg-primary text-white" : "border border-line text-muted"
              }`}
            >
              {p.done ? "✓" : ""}
            </span>
            <span className={p.done ? "text-ink" : "text-muted"}>
              <span className="font-medium">{p.phase}</span> — {p.label}
            </span>
          </li>
        ))}
      </ol>
    </main>
  );
}
