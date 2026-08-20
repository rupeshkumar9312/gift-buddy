import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2 } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { getOrder, type OrderDetail } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { colors } from "@/lib/theme";

export default function CheckoutSuccessScreen() {
  const { orderNumber } = useLocalSearchParams<{ orderNumber: string }>();
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!accessToken || !orderNumber) return;
    getOrder(accessToken, orderNumber)
      .then(setOrder)
      .catch(() => undefined);
  }, [accessToken, orderNumber]);

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: "center" }}>
        <View className="h-16 w-16 items-center justify-center rounded-full bg-cream">
          <CheckCircle2 size={28} color={colors.primary} />
        </View>
        <Text className="mt-5 text-center font-sans-medium text-2xl text-ink">
          Thank you for your order!
        </Text>
        <Text className="mt-2 text-center text-sm text-muted">
          Order <Text className="text-ink">{orderNumber}</Text> is confirmed. A receipt has been
          emailed to you.
        </Text>

        {order && (
          <View className="mt-8 w-full rounded-2xl border border-line bg-white p-6">
            <View className="flex-row justify-between border-b border-line pb-3">
              <Text className="text-sm text-muted">Status</Text>
              <Text className="text-sm font-sans-medium capitalize text-ink">
                {order.status.replace("_", " ")}
              </Text>
            </View>
            <View className="mt-3 flex-col gap-2">
              {order.items.map((item) => (
                <View key={item.sku} className="flex-row justify-between">
                  <Text className="flex-1 text-sm text-muted">
                    {item.productName} × {item.quantity}
                  </Text>
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

        <View className="mt-8 flex-col items-center gap-3">
          <Pressable
            onPress={() => router.replace("/shop")}
            className="items-center rounded-full border border-ink px-6 py-2.5"
          >
            <Text className="font-sans-medium text-sm uppercase tracking-wide text-ink">
              Continue Shopping
            </Text>
          </Pressable>
          {user ? (
            <Pressable
              onPress={() => router.replace("/orders")}
              className="items-center rounded-full bg-primary px-6 py-2.5"
            >
              <Text className="font-sans-medium text-sm uppercase tracking-wide text-white">
                View Order History
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.replace("/track-order")}
              className="items-center rounded-full bg-primary px-6 py-2.5"
            >
              <Text className="font-sans-medium text-sm uppercase tracking-wide text-white">
                Track This Order
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
