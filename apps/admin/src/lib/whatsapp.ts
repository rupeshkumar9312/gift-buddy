const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";

// Bare 10-digit numbers default to India (+91), matching the phone
// normalization convention already used for OTP login in apps/api's
// AuthService. Also strips a leading trunk "0" (e.g. "08532077953", a
// common domestic-dialing format) before adding the country code — plain
// 10-digit normalization alone leaves that 0 in place, producing an
// unreachable number. Shipping-address phones are free text with no format
// enforced at checkout, so this is still a best-effort guess, not a
// guarantee.
function normalizePhoneForWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

// Builds a wa.me "click to chat" link — the only channel that sends a
// WhatsApp message for free, with no account/API setup. It opens WhatsApp
// (web or app) with the message already composed; a person still has to
// press Send there themselves, since actually auto-sending requires the
// paid WhatsApp Business API. Returns null when there's no usable phone
// number to build a link for.
export function buildOrderWhatsAppLink(params: {
  phone: string | null;
  firstName: string;
  orderNumber: string;
  statusLabel: string;
  orderEmail: string;
}): string | null {
  if (!params.phone) return null;
  const waPhone = normalizePhoneForWhatsApp(params.phone);
  if (!waPhone) return null;

  const trackingLink = `${WEB_URL}/track-orders?order=${encodeURIComponent(params.orderNumber)}&email=${encodeURIComponent(params.orderEmail)}`;

  const message = [
    `Hi ${params.firstName}! 👋`,
    "",
    `Your GiftBuddy order *${params.orderNumber}* is now *${params.statusLabel}*.`,
    "",
    `Track your order here: ${trackingLink}`,
    "",
    "Thank you for shopping with us! 🎁",
  ].join("\n");

  return `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
}
