import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { cancelOrder, getOrder, type OrderDetail } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { CANCELLABLE_STATUSES, STATUS_LABEL } from "@/lib/orderStatus";
import { colors } from "@/lib/theme";

export default function OrderDetailScreen() {
  const { orderNumber } = useLocalSearchParams<{ orderNumber: string }>();
  const { accessToken, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !orderNumber) return;
    getOrder(accessToken, orderNumber)
      .then(setOrder)
      .catch(() => setError(true));
  }, [accessToken, orderNumber]);

  const handleCancel = async () => {
    if (!accessToken || !orderNumber) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const updated = await cancelOrder(orderNumber, { accessToken });
      setOrder(updated);
      setConfirmingCancel(false);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Couldn't cancel your order.");
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading || (!order && !error)) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ headerTitle: orderNumber ?? "Order Details" }} />
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 items-center justify-center gap-3 bg-background px-8">
        <Stack.Screen options={{ headerTitle: orderNumber ?? "Order Details" }} />
        <Text className="text-center text-sm text-muted">We couldn&rsquo;t find that order.</Text>
        <Pressable onPress={() => router.replace("/orders")}>
          <Text className="text-sm text-primary">Back to order history</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <Stack.Screen options={{ headerTitle: order.orderNumber }} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="rounded-2xl border border-line bg-white p-5">
          <View className="flex-row items-center justify-between border-b border-line pb-4">
            <Text className="text-sm text-muted">Status</Text>
            <View className="rounded-full bg-cream px-3 py-1">
              <Text className="text-xs font-sans-medium uppercase tracking-wide text-primary">
                {STATUS_LABEL[order.status] ?? order.status}
              </Text>
            </View>
          </View>

          {CANCELLABLE_STATUSES.includes(order.status) && (
            <View className="border-b border-line py-4">
              {cancelError && <Text className="mb-3 text-sm text-primary">{cancelError}</Text>}
              {confirmingCancel ? (
                <View className="flex-row flex-wrap items-center gap-3">
                  <Text className="text-sm text-muted">Cancel this order? This can&rsquo;t be undone.</Text>
                  <Pressable
                    onPress={handleCancel}
                    disabled={cancelling}
                    className="rounded-full bg-primary px-5 py-2 disabled:opacity-60"
                  >
                    <Text className="text-xs font-sans-medium uppercase tracking-wide text-white">
                      {cancelling ? "Cancelling…" : "Yes, cancel order"}
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
                  className="items-start rounded-full border border-line px-5 py-2"
                >
                  <Text className="text-xs font-sans-medium uppercase tracking-wide text-ink">
                    Cancel Order
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          <View className="mt-4 flex-col gap-4">
            {order.items.map((item) => (
              <View key={item.sku} className="flex-row items-center gap-4">
                <View className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                  {item.productImage && (
                    <Image
                      source={{ uri: item.productImage }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-sans-medium text-ink">{item.productName}</Text>
                  <Text className="text-sm text-muted">
                    Qty {item.quantity} · {formatMoney(item.unitPrice)} each
                  </Text>
                </View>
                <Text className="text-sm font-sans-medium text-ink">{formatMoney(item.lineTotal)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-6 rounded-2xl border border-line bg-white p-5">
          <Text className="text-sm font-sans-semibold uppercase tracking-wide text-muted">Order Timeline</Text>
          <View className="mt-4 flex-col gap-3">
            {order.statusHistory.map((event, index) => (
              <View key={index} className="flex-row items-center justify-between">
                <Text className="text-sm text-ink">{STATUS_LABEL[event.toStatus] ?? event.toStatus}</Text>
                <Text className="text-sm text-muted">{new Date(event.createdAt).toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-6 rounded-2xl bg-cream p-5">
          <Text className="text-sm font-sans-semibold uppercase tracking-wide text-muted">Shipping Address</Text>
          <Text className="mt-2 text-sm text-ink">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            {"\n"}
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
            {"\n"}
            {order.shippingAddress.city}, {order.shippingAddress.region} {order.shippingAddress.postalCode}
            {"\n"}
            {order.shippingAddress.country}
          </Text>

          <View className="mt-5 flex-col gap-2 border-t border-line pt-4">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Subtotal</Text>
              <Text className="text-sm text-ink">{formatMoney(order.subtotal)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Shipping ({order.shippingMethodName})</Text>
              <Text className="text-sm text-ink">{formatMoney(order.shippingTotal)}</Text>
            </View>
            <View className="flex-row justify-between border-t border-line pt-2">
              <Text className="font-sans-semibold text-base text-ink">Total</Text>
              <Text className="font-sans-semibold text-base text-ink">
                {formatMoney(order.total, order.currency)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
