import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { Minus, Plus, ShoppingBag } from "lucide-react-native";
import { StarRating } from "@/components/StarRating";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import { getProductBySlug, getRelatedProducts } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { colors } from "@/lib/theme";

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getProductBySlug(slug).then((p) => {
      setProduct(p);
      if (p) getRelatedProducts(p.slug).then(setRelated);
    });
  }, [slug]);

  if (product === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (product === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-sm text-muted">We couldn&apos;t find that product.</Text>
      </View>
    );
  }

  const images = [product.image, product.image2, ...product.gallery].filter(
    (img, i, arr): img is string => Boolean(img) && arr.indexOf(img) === i
  );
  const price = product.salePrice ?? product.price;

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
    } finally {
      setAdding(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <View className="aspect-square w-full bg-cream">
        <Image source={{ uri: images[activeImage] }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
      </View>
      {images.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, padding: 16 }}>
          {images.map((img, i) => (
            <Pressable
              key={img}
              onPress={() => setActiveImage(i)}
              className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${
                i === activeImage ? "border-primary" : "border-line"
              }`}
            >
              <Image source={{ uri: img }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View className="px-5 pb-10 pt-2">
        <Text className="font-sans-medium text-2xl text-ink">{product.name}</Text>
        <View className="mt-2 flex-row items-center gap-2">
          <StarRating rating={product.rating} />
          <Text className="text-xs text-muted">({product.reviews} reviews)</Text>
        </View>
        <View className="mt-3 flex-row items-center gap-3">
          <Text className="font-sans-semibold text-2xl text-primary">{formatMoney(price)}</Text>
          {product.salePrice && (
            <Text className="text-base text-muted line-through">{formatMoney(product.price)}</Text>
          )}
        </View>
        <Text className="mt-4 text-sm leading-relaxed text-muted">{product.description}</Text>
        <Text className="mt-4 text-xs text-muted">SKU: {product.sku}</Text>

        <View className="mt-6 flex-row items-center gap-4">
          <View className="flex-row items-center gap-4 rounded-full border border-line px-4 py-2.5">
            <Pressable onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
              <Minus size={15} color={colors.ink} />
            </Pressable>
            <Text className="min-w-5 text-center text-sm text-ink">{quantity}</Text>
            <Pressable onPress={() => setQuantity((q) => q + 1)}>
              <Plus size={15} color={colors.ink} />
            </Pressable>
          </View>
          <Pressable
            onPress={handleAddToCart}
            disabled={!product.inStock || adding}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-full bg-ink py-3.5"
          >
            <ShoppingBag size={15} color={colors.white} />
            <Text className="font-sans-medium text-xs uppercase tracking-wide text-white">
              {product.inStock ? (adding ? "Adding…" : "Add to Cart") : "Sold Out"}
            </Text>
          </Pressable>
        </View>
      </View>

      {related.length > 0 && (
        <View className="border-t border-line py-10">
          <SectionHeading eyebrow="You May Also Like" title="Related Gifts" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingHorizontal: 20, paddingTop: 24 }}
          >
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} width={165} />
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}
