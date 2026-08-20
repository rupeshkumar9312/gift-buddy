import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  checkout,
  devConfirmPayment,
  getCheckoutConfig,
  getShippingMethods,
  type CheckoutResult,
  type ShippingMethod,
} from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { colors } from "@/lib/theme";

const inputClassName = "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink";

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
  country: "US",
};

export default function CheckoutScreen() {
  const { lines, subtotal, discountTotal, couponCode, refreshCart } = useCart();
  const { user, accessToken } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingMethodId, setShippingMethodId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [gatewayEnabled, setGatewayEnabled] = useState(true);
  const [prefilled, setPrefilled] = useState(false);

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
  }, []);

  useEffect(() => {
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
  }, [user, prefilled]);

  const setField = (key: keyof FormState) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const selectedShipping = shippingMethods.find((m) => m.id === shippingMethodId);
  const shippingCost = selectedShipping
    ? selectedShipping.freeOverAmount !== null && subtotal >= selectedShipping.freeOverAmount
      ? 0
      : selectedShipping.price
    : 0;
  const estimatedTotal = Math.max(0, subtotal + shippingCost - discountTotal);

  const handleSubmit = async () => {
    if (!shippingMethodId) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await checkout(
        {
          email: form.email,
          shippingAddress: {
            firstName: form.firstName,
            lastName: form.lastName,
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            region: form.region,
            postalCode: form.postalCode,
            country: form.country,
            phone: form.phone || undefined,
          },
          shippingMethodId,
        },
        accessToken
      );
      if (res.paymentMethod === "cod") {
        await refreshCart();
        router.replace(`/checkout/success/${res.orderNumber}`);
        return;
      }
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout. Please try again.");
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
      router.replace(`/checkout/success/${result.orderNumber}`);
    } catch {
      setError("Couldn't confirm payment. Please try again.");
      setConfirming(false);
    }
  };

  const requiredFilled =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.country.trim() &&
    form.line1.trim() &&
    form.city.trim() &&
    form.region.trim() &&
    form.postalCode.trim();

  if (lines.length === 0 && !result) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-sm text-muted">Your cart is empty.</Text>
        <Pressable onPress={() => router.replace("/shop")} className="mt-3">
          <Text className="text-sm text-primary">Continue shopping</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {!result ? (
          <>
            <View className="rounded-2xl bg-cream p-5">
              {lines.map((line) => (
                <View key={line.productId} className="flex-row items-center gap-3 py-2">
                  <View className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
                    {line.image && (
                      <Image source={{ uri: line.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text numberOfLines={1} className="text-sm text-ink">
                      {line.name}
                    </Text>
                    <Text className="text-xs text-muted">Qty {line.quantity}</Text>
                  </View>
                  <Text className="text-sm font-sans-medium text-ink">{formatMoney(line.lineTotal)}</Text>
                </View>
              ))}
              <View className="mt-3 flex-col gap-2 border-t border-line pt-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Subtotal</Text>
                  <Text className="text-sm text-ink">{formatMoney(subtotal)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Shipping</Text>
                  <Text className="text-sm text-ink">{shippingCost === 0 ? "Free" : formatMoney(shippingCost)}</Text>
                </View>
                {discountTotal > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Discount{couponCode ? ` (${couponCode})` : ""}</Text>
                    <Text className="text-sm text-primary">-{formatMoney(discountTotal)}</Text>
                  </View>
                )}
                <View className="flex-row justify-between border-t border-line pt-2">
                  <Text className="font-sans-semibold text-base text-ink">Total</Text>
                  <Text className="font-sans-semibold text-base text-ink">{formatMoney(estimatedTotal)}</Text>
                </View>
              </View>
            </View>

            <Text className="mb-4 mt-8 font-sans-medium text-lg text-ink">Shipping Details</Text>
            <View className="flex-col gap-3">
              <View className="flex-row gap-3">
                <TextInput
                  placeholder="First name"
                  placeholderTextColor={colors.muted}
                  value={form.firstName}
                  onChangeText={setField("firstName")}
                  className={`flex-1 ${inputClassName}`}
                />
                <TextInput
                  placeholder="Last name"
                  placeholderTextColor={colors.muted}
                  value={form.lastName}
                  onChangeText={setField("lastName")}
                  className={`flex-1 ${inputClassName}`}
                />
              </View>
              <TextInput
                placeholder="Email address"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={form.email}
                onChangeText={setField("email")}
                className={inputClassName}
              />
              <TextInput
                placeholder="Phone"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={setField("phone")}
                className={inputClassName}
              />
              <TextInput
                placeholder="Country (e.g. US)"
                placeholderTextColor={colors.muted}
                autoCapitalize="characters"
                maxLength={2}
                value={form.country}
                onChangeText={(v) => setField("country")(v.toUpperCase())}
                className={inputClassName}
              />
              <TextInput
                placeholder="Street address"
                placeholderTextColor={colors.muted}
                value={form.line1}
                onChangeText={setField("line1")}
                className={inputClassName}
              />
              <TextInput
                placeholder="Apartment, suite, etc. (optional)"
                placeholderTextColor={colors.muted}
                value={form.line2}
                onChangeText={setField("line2")}
                className={inputClassName}
              />
              <TextInput
                placeholder="City"
                placeholderTextColor={colors.muted}
                value={form.city}
                onChangeText={setField("city")}
                className={inputClassName}
              />
              <TextInput
                placeholder="State / Region"
                placeholderTextColor={colors.muted}
                value={form.region}
                onChangeText={setField("region")}
                className={inputClassName}
              />
              <TextInput
                placeholder="ZIP / Postal code"
                placeholderTextColor={colors.muted}
                value={form.postalCode}
                onChangeText={setField("postalCode")}
                className={inputClassName}
              />
            </View>

            {shippingMethods.length > 0 && (
              <>
                <Text className="mb-3 mt-8 font-sans-medium text-lg text-ink">Shipping Method</Text>
                <View className="flex-col gap-3">
                  {shippingMethods.map((method) => (
                    <Pressable
                      key={method.id}
                      onPress={() => setShippingMethodId(method.id)}
                      className={`flex-row items-center justify-between rounded-xl border px-4 py-3.5 ${
                        shippingMethodId === method.id ? "border-primary bg-cream" : "border-line"
                      }`}
                    >
                      <Text className="text-sm text-ink">{method.name}</Text>
                      <Text className="text-sm text-muted">
                        {method.freeOverAmount !== null && subtotal >= method.freeOverAmount
                          ? "Free"
                          : formatMoney(method.price)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {error && (
              <Text className="mt-6 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
                {error}
              </Text>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={submitting || !shippingMethodId || !requiredFilled}
              className="mt-8 items-center rounded-full bg-primary py-3.5 disabled:opacity-60"
            >
              <Text className="font-sans-medium text-sm uppercase tracking-wide text-white">
                {submitting
                  ? "Placing order…"
                  : gatewayEnabled
                    ? "Continue to Payment"
                    : "Place Order (Pay on Delivery)"}
              </Text>
            </Pressable>
          </>
        ) : (
          <View>
            <Text className="font-sans-medium text-lg text-ink">Payment</Text>
            <Text className="mt-2 text-sm text-muted">
              Order <Text className="text-ink">{result.orderNumber}</Text> — charging{" "}
              <Text className="text-ink">{formatMoney(result.total, result.currency)}</Text>
            </Text>

            {error && (
              <Text className="mt-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
                {error}
              </Text>
            )}

            <View className="mt-6">
              {result.devMode ? (
                <View className="rounded-xl border border-dashed border-line bg-cream p-6">
                  <Text className="text-sm text-muted">
                    No Stripe account is configured for this environment, so payment is simulated.
                    In production this step collects a real card and charges it in Stripe test
                    mode.
                  </Text>
                  <Pressable
                    onPress={handleDevConfirm}
                    disabled={confirming}
                    className="mt-4 items-center rounded-full bg-primary py-3.5 disabled:opacity-60"
                  >
                    <Text className="font-sans-medium text-sm uppercase tracking-wide text-white">
                      {confirming ? "Confirming…" : "Simulate Payment (Dev Mode)"}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View className="rounded-xl border border-dashed border-line bg-cream p-6">
                  <Text className="text-sm text-muted">
                    Card payments aren&apos;t available in the app yet. Please finish this order
                    from the GiftBuddy website — your order is saved and won&apos;t be charged
                    until then.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
