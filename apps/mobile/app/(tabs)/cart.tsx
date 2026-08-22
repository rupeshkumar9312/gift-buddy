import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Minus, Plus, Trash2, X } from "lucide-react-native";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/format";
import { colors } from "@/lib/theme";

export default function CartScreen() {
  const {
    lines,
    isLoading,
    subtotal,
    discountTotal,
    total,
    couponCode,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!code.trim()) return;
    setApplying(true);
    setCouponError(null);
    try {
      await applyCoupon(code.trim());
      setCode("");
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "That coupon code isn't valid.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScreenHeader title="Your Cart" />

      {isLoading ? (
        <ActivityIndicator color={colors.primary} className="mt-10" />
      ) : lines.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2 px-8">
          <Text className="text-sm text-muted">Your cart is empty.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={lines}
            keyExtractor={(item) => String(item.productId)}
            contentContainerStyle={{ padding: 20, gap: 16 }}
            renderItem={({ item }) => (
              <View className="flex-row gap-3">
                <View className="h-20 w-20 overflow-hidden rounded-xl bg-cream">
                  {item.image && (
                    <Image source={{ uri: item.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                  )}
                </View>
                <View className="flex-1 justify-between">
                  <View>
                    <Text numberOfLines={1} className="font-sans-medium text-sm text-ink">
                      {item.name}
                    </Text>
                    <Text className="mt-0.5 text-sm text-muted">
                      {formatMoney(item.salePrice ?? item.price)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-3 rounded-full border border-line px-2 py-1">
                      <Pressable onPress={() => updateQuantity(item.productId, item.quantity - 1)}>
                        <Minus size={13} color={colors.ink} />
                      </Pressable>
                      <Text className="min-w-4 text-center text-sm text-ink">{item.quantity}</Text>
                      <Pressable onPress={() => updateQuantity(item.productId, item.quantity + 1)}>
                        <Plus size={13} color={colors.ink} />
                      </Pressable>
                    </View>
                    <Pressable onPress={() => removeFromCart(item.productId)}>
                      <Trash2 size={16} color={colors.muted} />
                    </Pressable>
                  </View>
                </View>
                <Text className="font-sans-medium text-sm text-ink">{formatMoney(item.lineTotal)}</Text>
              </View>
            )}
            ListFooterComponent={
              <View className="mt-2">
                <Text className="mb-2 text-sm text-muted">Have a coupon?</Text>
                {couponCode ? (
                  <View className="flex-row items-center justify-between rounded-xl border border-line bg-cream px-4 py-2.5">
                    <Text className="text-sm text-ink">
                      Applied: <Text className="font-sans-medium">{couponCode}</Text>
                    </Text>
                    <Pressable onPress={() => removeCoupon()}>
                      <X size={16} color={colors.muted} />
                    </Pressable>
                  </View>
                ) : (
                  <View className="flex-row gap-2">
                    <TextInput
                      value={code}
                      onChangeText={setCode}
                      placeholder="Coupon code"
                      placeholderTextColor={colors.muted}
                      autoCapitalize="characters"
                      className="flex-1 rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink"
                    />
                    <Pressable
                      onPress={handleApplyCoupon}
                      disabled={applying || !code.trim()}
                      className="items-center justify-center rounded-xl bg-ink px-5 disabled:opacity-60"
                    >
                      <Text className="font-sans-medium text-xs uppercase tracking-wide text-white">
                        {applying ? "Applying…" : "Apply"}
                      </Text>
                    </Pressable>
                  </View>
                )}
                {couponError && <Text className="mt-2 text-xs text-primary">{couponError}</Text>}
              </View>
            }
          />

          <View className="border-t border-line bg-white px-5 py-5">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Subtotal</Text>
              <Text className="text-sm text-ink">{formatMoney(subtotal)}</Text>
            </View>
            {discountTotal > 0 && (
              <View className="mt-1.5 flex-row justify-between">
                <Text className="text-sm text-muted">Discount{couponCode ? ` (${couponCode})` : ""}</Text>
                <Text className="text-sm text-primary">-{formatMoney(discountTotal)}</Text>
              </View>
            )}
            <View className="mt-2 flex-row justify-between">
              <Text className="font-sans-medium text-base text-ink">Total</Text>
              <Text className="font-sans-semibold text-base text-ink">{formatMoney(total)}</Text>
            </View>
            <Pressable
              onPress={() => router.push("/checkout")}
              className="mt-4 items-center rounded-full bg-primary py-3.5"
            >
              <Text className="font-sans-medium text-xs uppercase tracking-wide text-white">
                Proceed to Checkout
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
