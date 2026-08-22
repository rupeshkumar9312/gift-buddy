"use client";

import Image from "next/image";
import Link from "next/link";
import { Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageBanner } from "@/components/PageBanner";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  checkout,
  devConfirmPayment,
  getCheckoutConfig,
  getShippingMethods,
  getSocieties,
  submitOutOfAreaOrder,
  type CheckoutResult,
  type ShippingMethod,
  type Society,
} from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { StripePaymentForm } from "./StripePaymentForm";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "IN",
};

export default function CheckoutPage() {
  const { lines, subtotal, discountTotal, couponCode, refreshCart } = useCart();
  const { user, accessToken } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingMethodId, setShippingMethodId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [outOfArea, setOutOfArea] = useState(false);
  const [gatewayEnabled, setGatewayEnabled] = useState(true);

  useEffect(() => {
    getShippingMethods()
      .then((methods) => {
        setShippingMethods(methods);
        setShippingMethodId(methods[0]?.id ?? null);
      })
      .catch(() => undefined);
    getCheckoutConfig()
      .then((config) => setGatewayEnabled(config.gatewayEnabled))
      .catch(() => undefined);
    getSocieties()
      .then(setSocieties)
      .catch(() => undefined);
  }, []);

  const [prefilled, setPrefilled] = useState(false);
  if (user && !prefilled) {
    setPrefilled(true);
    setForm((prev) => ({
      ...prev,
      firstName: prev.firstName || user.firstName,
      lastName: prev.lastName || user.lastName,
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
    }));
  }

  const selectedShipping = shippingMethods.find(
    (m) => m.id === shippingMethodId,
  );
  const shippingCost = selectedShipping
    ? selectedShipping.freeOverAmount !== null &&
      subtotal >= selectedShipping.freeOverAmount
      ? 0
      : selectedShipping.price
    : 0;
  const estimatedTotal = Math.max(0, subtotal + shippingCost - discountTotal);

  const isServiceableSociety = societies.some(
    (society) => society.name.trim().toLowerCase() === form.line2.trim().toLowerCase(),
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!shippingMethodId) return;
    setError(null);
    setSubmitting(true);
    try {
      if (!isServiceableSociety) {
        await submitOutOfAreaOrder({
          email: form.email,
          address: {
            firstName: form.firstName,
            lastName: form.lastName,
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            region: form.region,
            postalCode: form.postalCode,
            country: form.country,
            phone: form.phone || undefined,
          },
          items: lines.map((line) => ({
            productId: line.productId,
            name: line.name,
            quantity: line.quantity,
            price: line.salePrice ?? line.price,
            lineTotal: line.lineTotal,
          })),
          subtotal,
        });
        setOutOfArea(true);
        return;
      }

      const res = await checkout(
        {
          email: form.email,
          shippingAddress: {
            firstName: form.firstName,
            lastName: form.lastName,
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            region: form.region,
            postalCode: form.postalCode,
            country: form.country,
            phone: form.phone || undefined,
          },
          shippingMethodId,
        },
        accessToken,
      );
      if (res.paymentMethod === "cod") {
        await refreshCart();
        router.push(`/checkout/success/${res.orderNumber}`);
        return;
      }
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't start checkout. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDevConfirm = async () => {
    if (!result) return;
    setConfirming(true);
    try {
      await devConfirmPayment(result.orderNumber);
      await refreshCart();
      router.push(`/checkout/success/${result.orderNumber}`);
    } catch {
      setError("Couldn't confirm payment. Please try again.");
      setConfirming(false);
    }
  };

  if (lines.length === 0 && !result) {
    return (
      <>
        <PageBanner
          title="Checkout"
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />
        <div className="container-page py-20 text-center text-sm text-muted">
          Your cart is empty.{" "}
          <Link
            href="/shop"
            className="text-primary underline underline-offset-4"
          >
            Continue shopping
          </Link>
          .
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner
        title="Checkout"
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <div className="container-page py-14">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]">
          <div className="flex flex-col gap-10">
            {outOfArea ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line bg-cream px-8 py-16 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Gift size={26} />
                </span>
                <h2 className="font-script text-3xl text-primary">
                  Coming Soon to Your Location!
                </h2>
                <p className="max-w-md text-sm text-muted">
                  We don&apos;t deliver to &ldquo;{form.line2}&rdquo; just yet, but
                  we&apos;ve saved your order details and our team will reach out as
                  soon as we expand to your area.
                </p>
                <Link
                  href="/shop"
                  className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : !result ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                <div>
                  <h2 className="text-lg font-medium">Shipping Details</h2>
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                      required
                      placeholder="First name"
                      value={form.firstName}
                      onChange={(e) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      required
                      placeholder="Last name"
                      value={form.lastName}
                      onChange={(e) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      required
                      type="email"
                      placeholder="Email address"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className={`sm:col-span-2 ${inputClass}`}
                    />
                    <input
                      placeholder="Phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      required
                      placeholder="Country (e.g. IN)"
                      maxLength={2}
                      value={form.country}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          country: e.target.value.toUpperCase(),
                        })
                      }
                      className={inputClass}
                    />
                    <input
                      required
                      placeholder="Street address"
                      value={form.line1}
                      onChange={(e) =>
                        setForm({ ...form, line1: e.target.value })
                      }
                      className={`sm:col-span-2 ${inputClass}`}
                    />
                    <input
                      required
                      list="society-options"
                      placeholder="Society / apartment name"
                      value={form.line2}
                      onChange={(e) =>
                        setForm({ ...form, line2: e.target.value })
                      }
                      className={`sm:col-span-2 ${inputClass}`}
                    />
                    <datalist id="society-options">
                      {societies.map((society) => (
                        <option key={society.id} value={society.name} />
                      ))}
                    </datalist>
                    <input
                      required
                      placeholder="City"
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      required
                      placeholder="State / Region"
                      value={form.region}
                      onChange={(e) =>
                        setForm({ ...form, region: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      required
                      placeholder="ZIP / Postal code"
                      value={form.postalCode}
                      onChange={(e) =>
                        setForm({ ...form, postalCode: e.target.value })
                      }
                      className={`sm:col-span-2 ${inputClass}`}
                    />
                  </div>
                </div>

                {shippingMethods.length > 0 && (
                  <div>
                    <h2 className="text-lg font-medium">Shipping Method</h2>
                    <div className="mt-5 flex flex-col gap-3">
                      {shippingMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-sm transition ${
                            shippingMethodId === method.id
                              ? "border-primary bg-cream"
                              : "border-line"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shippingMethod"
                              checked={shippingMethodId === method.id}
                              onChange={() => setShippingMethodId(method.id)}
                              className="h-4 w-4 accent-[#be7374]"
                            />
                            {method.name}
                          </span>
                          <span className="text-muted">
                            {method.freeOverAmount !== null &&
                            subtotal >= method.freeOverAmount
                              ? "Free"
                              : formatMoney(method.price)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <p className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !shippingMethodId}
                  className="w-full rounded-full bg-primary py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Placing order…"
                    : gatewayEnabled
                      ? "Continue to Payment"
                      : "Place Order (Pay on Delivery)"}
                </button>
              </form>
            ) : (
              <div>
                <h2 className="text-lg font-medium">Payment</h2>
                <p className="mt-2 text-sm text-muted">
                  Order{" "}
                  <span className="font-medium text-ink">
                    {result.orderNumber}
                  </span>{" "}
                  — charging{" "}
                  <span className="font-medium text-ink">
                    {formatMoney(result.total, result.currency)}
                  </span>
                </p>

                {error && (
                  <p className="mt-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
                    {error}
                  </p>
                )}

                <div className="mt-6">
                  {result.devMode ? (
                    <div className="rounded-xl border border-dashed border-line bg-cream p-6 text-sm">
                      <p className="text-muted">
                        No Stripe account is configured for this environment, so
                        payment is simulated. In production this step collects a
                        real card via Stripe Elements and charges it in Stripe
                        test mode.
                      </p>
                      <button
                        onClick={handleDevConfirm}
                        disabled={confirming}
                        className="mt-4 w-full rounded-full bg-primary py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {confirming
                          ? "Confirming…"
                          : "Simulate Payment (Dev Mode)"}
                      </button>
                    </div>
                  ) : result.publishableKey && result.clientSecret ? (
                    <StripePaymentForm
                      publishableKey={result.publishableKey}
                      clientSecret={result.clientSecret}
                      onSuccess={() => {
                        void refreshCart();
                        router.push(`/checkout/success/${result.orderNumber}`);
                      }}
                    />
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-2xl bg-cream p-7">
            <h2 className="text-lg font-medium">Your Order</h2>
            <ul className="mt-5 flex flex-col gap-4">
              {lines.length === 0 ? (
                <p className="text-sm text-muted">Your cart is empty.</p>
              ) : (
                lines.map((line) => (
                  <li key={line.productId} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                      {line.image && (
                        <Image
                          src={line.image}
                          alt={line.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      )}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-ink">{line.name}</p>
                      <p className="text-muted">Qty {line.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">
                      {formatMoney(line.lineTotal)}
                    </span>
                  </li>
                ))
              )}
            </ul>

            <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="text-ink">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="text-ink">
                  {shippingCost === 0 ? "Free" : formatMoney(shippingCost)}
                </span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-muted">
                  <span>Discount{couponCode ? ` (${couponCode})` : ""}</span>
                  <span className="text-primary">
                    -{formatMoney(discountTotal)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
                <span>Total</span>
                <span>{formatMoney(result?.total ?? estimatedTotal)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
