"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  createAdminOrder,
  getProducts,
  getShippingMethods,
  type AdminProductSummary,
  type ShippingMethod,
} from "@/lib/api";
import { formatMoney } from "@/lib/format";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}

type SelectedItem = { product: AdminProductSummary; quantity: number };

export default function NewOrderPage() {
  const router = useRouter();
  const { accessToken } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("IN");
  const [phone, setPhone] = useState("");

  const [products, setProducts] = useState<AdminProductSummary[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selected, setSelected] = useState<SelectedItem[]>([]);

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingMethodId, setShippingMethodId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "paid">("cod");
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getProducts(accessToken, { limit: 200 })
      .then((res) => setProducts(res.data.filter((p) => p.isActive)))
      .catch(() => undefined);
    getShippingMethods()
      .then((methods) => {
        setShippingMethods(methods);
        setShippingMethodId(methods[0]?.id ?? null);
      })
      .catch(() => undefined);
  }, [accessToken]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return [];
    return products
      .filter(
        (p) =>
          !selected.some((s) => s.product.id === p.id) &&
          (p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query))
      )
      .slice(0, 8);
  }, [products, productSearch, selected]);

  const addProduct = (product: AdminProductSummary) => {
    setSelected((prev) => [...prev, { product, quantity: 1 }]);
    setProductSearch("");
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setSelected((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const removeProduct = (productId: number) => {
    setSelected((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = selected.reduce(
    (sum, item) => sum + (item.product.salePrice ?? item.product.price) * item.quantity,
    0
  );
  const selectedShipping = shippingMethods.find((m) => m.id === shippingMethodId);
  const shippingCost = selectedShipping
    ? selectedShipping.freeOverAmount !== null && subtotal >= selectedShipping.freeOverAmount
      ? 0
      : selectedShipping.price
    : 0;
  const estimatedTotal = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken || !shippingMethodId || selected.length === 0) return;
    setError(null);
    setSubmitting(true);
    try {
      const order = await createAdminOrder(accessToken, {
        email,
        shippingAddress: {
          firstName,
          lastName,
          line1,
          line2,
          city,
          region,
          postalCode,
          country,
          phone: phone || undefined,
        },
        items: selected.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        shippingMethodId,
        paymentMethod,
        note: note || undefined,
      });
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">New Order</h1>
        <p className="mt-1 text-sm text-muted">
          Create an order on a customer&apos;s behalf — a phone order or a walk-in sale.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Customer</h2>
            <Field label="Email">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className={inputClass}
              />
            </Field>
            <p className="text-xs text-muted">
              If this matches an existing customer account, the order is linked to it automatically.
            </p>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Shipping Address
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="First name">
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Last name">
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Phone">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Country">
                <input
                  required
                  maxLength={2}
                  value={country}
                  onChange={(e) => setCountry(e.target.value.toUpperCase())}
                  className={inputClass}
                />
              </Field>
              <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                <span className="text-muted">Street address</span>
                <input
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                <span className="text-muted">Apartment / society</span>
                <input
                  required
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className={inputClass}
                />
              </label>
              <Field label="City">
                <input required value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
              </Field>
              <Field label="State / Region">
                <input
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                <span className="text-muted">Postal code</span>
                <input
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Products</h2>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by name or SKU"
                className={`${inputClass} pl-10`}
              />
              {filteredProducts.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-xl border border-line bg-white shadow-lg">
                  {filteredProducts.map((product) => (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => addProduct(product)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-cream"
                    >
                      <span className="text-ink">{product.name}</span>
                      <span className="text-muted">
                        {formatMoney(product.salePrice ?? product.price)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col divide-y divide-line">
              {selected.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-ink">{item.product.name}</p>
                    <p className="text-xs text-muted">
                      {formatMoney(item.product.salePrice ?? item.product.price)} each
                    </p>
                  </div>
                  <div className="flex items-center rounded-full border border-line">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-ink transition hover:text-primary"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-7 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-ink transition hover:text-primary"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="w-20 text-right text-sm font-medium text-ink">
                    {formatMoney((item.product.salePrice ?? item.product.price) * item.quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeProduct(item.product.id)}
                    aria-label="Remove"
                    className="flex h-8 w-8 items-center justify-center text-muted transition hover:text-primary"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {selected.length === 0 && (
                <p className="py-4 text-center text-sm text-muted">Search above to add products.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="flex h-fit flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Shipping Method
            </h2>
            <select
              value={shippingMethodId ?? ""}
              onChange={(e) => setShippingMethodId(Number(e.target.value))}
              className={inputClass}
            >
              {shippingMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name} — {formatMoney(method.price)}
                </option>
              ))}
            </select>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Payment</h2>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                checked={paymentMethod === "paid"}
                onChange={() => setPaymentMethod("paid")}
              />
              Already paid (cash, UPI, bank transfer)
            </label>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Note</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Optional — e.g. how payment was collected"
              className={inputClass}
            />
          </section>

          <section className="rounded-2xl bg-cream p-6 text-sm">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="text-ink">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="text-ink">{shippingCost === 0 ? "Free" : formatMoney(shippingCost)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-ink">
                <span>Total</span>
                <span>{formatMoney(estimatedTotal)}</span>
              </div>
            </div>
          </section>

          {error && <p className="text-sm text-primary">{error}</p>}
          <button
            type="submit"
            disabled={submitting || selected.length === 0 || !shippingMethodId}
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create Order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
