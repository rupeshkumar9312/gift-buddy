export function formatMoney(amount: number, currency = "inr"): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency.toUpperCase() }).format(
    amount
  );
}

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  fulfilled: "Fulfilled",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const STATUS_TONE: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-700",
  paid: "bg-sky-100 text-sky-700",
  fulfilled: "bg-violet-100 text-violet-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-200 text-gray-600",
  refunded: "bg-rose-100 text-rose-700",
};
