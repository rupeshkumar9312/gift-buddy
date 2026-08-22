import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Package } from "lucide-react-native";
import { cancelOrder, trackOrder, type OrderDetail } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { CANCELLABLE_STATUSES, STATUS_LABEL } from "@/lib/orderStatus";
import { colors } from "@/lib/theme";

const inputClassName = "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink";

export default function TrackOrderScreen() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    setOrder(null);
    setConfirmingCancel(false);
    setCancelError(null);
    try {
      const result = await trackOrder(orderNumber.trim(), email.trim());
      setOrder(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't find that order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      const updated = await cancelOrder(orderNumber.trim(), { email: email.trim() });
      setOrder(updated);
      setConfirmingCancel(false);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Couldn't cancel your order.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: "center" }} keyboardShouldPersistTaps="handled">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-cream">
          <Package size={24} color={colors.primary} />
        </View>
        <Text className="mt-4 text-center text-sm leading-relaxed text-muted">
          To track your order, please enter your Order ID and the email address used at checkout
          below.
        </Text>

        <View className="mt-8 w-full flex-col gap-4">
          <View>
            <Text className="mb-1.5 text-sm text-muted">Order ID</Text>
            <TextInput
              placeholder="e.g. GB-20260812-1A2B3C4D"
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              value={orderNumber}
              onChangeText={setOrderNumber}
              className={inputClassName}
            />
          </View>
          <View>
            <Text className="mb-1.5 text-sm text-muted">Billing email</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              className={inputClassName}
            />
          </View>
          {error && (
            <Text className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
              {error}
            </Text>
          )}
          <Pressable
            onPress={handleSubmit}
            disabled={submitting || !orderNumber.trim() || !email.trim()}
            className="mt-2 items-center rounded-full bg-primary py-3.5 disabled:opacity-60"
          >
            <Text className="font-sans-medium text-sm uppercase tracking-wide text-white">
              {submitting ? "Searching…" : "Track Order"}
            </Text>
          </Pressable>
        </View>

        {order && (
          <View className="mt-8 w-full rounded-2xl border border-line bg-white p-5">
            <View className="flex-row items-center justify-between border-b border-line pb-3">
              <Text className="font-sans-medium text-sm text-ink">{order.orderNumber}</Text>
              <View className="rounded-full bg-cream px-3 py-1">
                <Text className="text-xs font-sans-medium uppercase tracking-wide text-primary">
                  {STATUS_LABEL[order.status] ?? order.status}
                </Text>
              </View>
            </View>

            {CANCELLABLE_STATUSES.includes(order.status) && (
              <View className="border-b border-line py-3">
                {cancelError && <Text className="mb-2 text-xs text-primary">{cancelError}</Text>}
                {confirmingCancel ? (
                  <View className="flex-row flex-wrap items-center gap-2">
                    <Text className="text-xs text-muted">Cancel this order? This can&rsquo;t be undone.</Text>
                    <Pressable
                      onPress={handleCancel}
                      disabled={cancelling}
                      className="rounded-full bg-primary px-4 py-1.5 disabled:opacity-60"
                    >
                      <Text className="text-xs font-sans-medium uppercase tracking-wide text-white">
                        {cancelling ? "Cancelling…" : "Yes, cancel"}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => setConfirmingCancel(false)} disabled={cancelling}>
                      <Text className="text-xs font-sans-medium uppercase tracking-wide text-muted">
                        Never mind
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setConfirmingCancel(true)}
                    className="items-start rounded-full border border-line px-4 py-1.5"
                  >
                    <Text className="text-xs font-sans-medium uppercase tracking-wide text-ink">
                      Cancel Order
                    </Text>
                  </Pressable>
                )}
              </View>
            )}

            <View className="mt-3 flex-col gap-3">
              {order.items.map((item) => (
                <View key={item.sku} className="flex-row items-center gap-3">
                  <View className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream">
                    {item.productImage && (
                      <Image
                        source={{ uri: item.productImage }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-ink">{item.productName}</Text>
                    <Text className="text-xs text-muted">Qty {item.quantity}</Text>
                  </View>
                  <Text className="text-sm text-ink">{formatMoney(item.lineTotal)}</Text>
                </View>
              ))}
            </View>
            <View className="mt-3 flex-row justify-between border-t border-line pt-3">
              <Text className="font-sans-semibold text-sm text-ink">Total</Text>
              <Text className="font-sans-semibold text-sm text-ink">
                {formatMoney(order.total, order.currency)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
