import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { ShoppingBag } from "lucide-react-native";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { colors } from "@/lib/theme";
import { StarRating } from "./StarRating";

const badgeClass: Record<NonNullable<Product["badge"]>, string> = {
  sale: "bg-primary",
  new: "bg-ink",
  hot: "bg-secondary",
};

const badgeTextClass: Record<NonNullable<Product["badge"]>, string> = {
  sale: "text-white",
  new: "text-white",
  hot: "text-ink",
};

const badgeLabel: Record<NonNullable<Product["badge"]>, string> = {
  sale: "Sale",
  new: "New",
  hot: "Hot",
};

// Fixed card width for horizontal-scroll rows (home page sections); the
// shop grid instead measures available width and passes its own via
// `style`, since a 2-column grid needs a flexible, not fixed, width.
export function ProductCard({ product, width }: { product: Product; width?: number }) {
  const router = useRouter();
  const { addToCart } = useCart();

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.slug}`)}
      style={width ? { width } : undefined}
      className="flex-col"
    >
      <View className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-cream">
        <Image source={{ uri: product.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        {product.badge && (
          <View className={`absolute left-3 top-3 rounded-full px-3 py-1 ${badgeClass[product.badge]}`}>
            <Text className={`font-sans-medium text-[10px] uppercase tracking-wide ${badgeTextClass[product.badge]}`}>
              {badgeLabel[product.badge]}
            </Text>
          </View>
        )}
        <Pressable
          onPress={() => addToCart(product.id)}
          disabled={!product.inStock}
          className="absolute bottom-3 right-3 h-10 w-10 items-center justify-center rounded-full bg-white shadow"
        >
          <ShoppingBag size={16} color={product.inStock ? colors.ink : colors.muted} />
        </Pressable>
      </View>

      <View className="mt-3 gap-1.5">
        <StarRating rating={product.rating} />
        <Text numberOfLines={1} className="font-sans-medium text-[14px] text-ink">
          {product.name}
        </Text>
        <View className="flex-row items-center gap-2">
          {product.salePrice ? (
            <>
              <Text className="font-sans-semibold text-sm text-primary">{formatMoney(product.salePrice)}</Text>
              <Text className="text-sm text-muted line-through">{formatMoney(product.price)}</Text>
            </>
          ) : (
            <Text className="font-sans-semibold text-sm text-ink">{formatMoney(product.price)}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
