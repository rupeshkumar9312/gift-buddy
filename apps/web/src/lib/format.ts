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

const IST_OFFSET_MINUTES = 5.5 * 60;
const SAME_DAY_CUTOFF_HOUR = 17; // 5 PM IST

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type EstimatedDelivery = {
  isSameDay: boolean;
  dateLabel: string;
};

// Orders placed before 5 PM IST are estimated for same-day delivery,
// otherwise the next day. Computed from a fixed +5:30 UTC offset (India has
// no DST) rather than Intl/timezone APIs — same reasoning as formatMoney
// above: this needs to produce an identical result on the Node server and
// in the browser regardless of either runtime's own ICU/timezone-database
// version, and a plain numeric offset plus hardcoded weekday/month names
// sidesteps that entirely instead of trusting locale data to agree.
export function getEstimatedDelivery(referenceDate: Date | string = new Date()): EstimatedDelivery {
  const ref = typeof referenceDate === "string" ? new Date(referenceDate) : referenceDate;
  const ist = new Date(ref.getTime() + IST_OFFSET_MINUTES * 60 * 1000);

  const isSameDay = ist.getUTCHours() < SAME_DAY_CUTOFF_HOUR;
  if (!isSameDay) {
    ist.setUTCDate(ist.getUTCDate() + 1);
  }

  return {
    isSameDay,
    dateLabel: `${WEEKDAYS[ist.getUTCDay()]}, ${ist.getUTCDate()} ${MONTHS[ist.getUTCMonth()]}`,
  };
}
