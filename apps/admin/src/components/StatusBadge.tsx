import { STATUS_LABEL, STATUS_TONE } from "@/lib/format";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        STATUS_TONE[status] ?? "bg-cream text-muted"
      }`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
