// Deliberately not `style: "currency"` — Intl's currency formatter varies
// whether it inserts a space between the ₹ symbol and the number depending
// on the runtime's ICU/CLDR data version, which differs between the Node
// server and the browser and causes a hydration mismatch. Plain number
// formatting (grouping + fixed decimals) is stable across environments, so
// the ₹ is prepended manually instead of letting Intl place it.
export function formatMoney(amount: number, currency = "inr"): string {
  if (currency.toLowerCase() !== "inr") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  }
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `₹${formatted}`;
}
