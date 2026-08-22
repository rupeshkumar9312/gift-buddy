import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { PackageSearch } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { getOrders, type OrderSummary } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/orderStatus";
import { colors } from "@/lib/theme";

export default function OrderHistoryScreen() {
  const { user, accessToken, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getOrders(accessToken)
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]));
  }, [accessToken]);

  if (authLoading || (accessToken && orders === null)) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <Text className="text-center text-sm text-muted">Sign in to view your order history.</Text>
        <Pressable onPress={() => router.replace("/account")} className="rounded-full bg-primary px-8 py-3">
          <Text className="font-sans-medium text-sm uppercase tracking-wide text-white">Go to Sign In</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (orders && orders.length === 0) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 items-center justify-center gap-4 bg-background px-8">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-cream">
          <PackageSearch size={24} color={colors.primary} />
        </View>
        <Text className="text-center text-sm text-muted">You haven&rsquo;t placed any orders yet.</Text>
        <Pressable onPress={() => router.push("/shop")} className="rounded-full bg-primary px-8 py-3">
          <Text className="font-sans-medium text-sm uppercase tracking-wide text-white">Start Shopping</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <FlatList
        data={orders ?? []}
        keyExtractor={(item) => item.orderNumber}
        contentContainerStyle={{ padding: 20 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/orders/${item.orderNumber}`)}
            className="flex-row items-center justify-between rounded-2xl border border-line bg-white p-4"
          >
            <View className="flex-1">
              <Text className="font-sans-medium text-sm text-ink">{item.orderNumber}</Text>
              <Text className="mt-0.5 text-xs text-muted">
                {new Date(item.createdAt).toLocaleDateString()} · {item.itemCount} item
                {item.itemCount === 1 ? "" : "s"}
              </Text>
              <Text className="mt-1 text-xs uppercase tracking-wide text-primary">
                {STATUS_LABEL[item.status] ?? item.status}
              </Text>
            </View>
            <Text className="font-sans-medium text-sm text-ink">{formatMoney(item.total, item.currency)}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
