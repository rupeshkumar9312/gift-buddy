import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "@/components/Logo";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import { getFeaturedProducts, getOccasions } from "@/lib/api";
import type { Occasion } from "@/lib/api";
import type { Product } from "@/lib/types";
import { colors } from "@/lib/theme";

const CARD_WIDTH = 165;
const OCCASION_CARD_WIDTH = 260;

export default function HomeScreen() {
  const router = useRouter();
  const [featured, setFeatured] = useState<Product[] | null>(null);
  const [occasions, setOccasions] = useState<Occasion[]>([]);

  useEffect(() => {
    getFeaturedProducts()
      .then(setFeatured)
      .catch(() => setFeatured([]));
    getOccasions()
      .then(setOccasions)
      .catch(() => setOccasions([]));
  }, []);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-line px-5 py-3">
        <Logo showTagline={false} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="bg-cream px-5 pb-10 pt-8">
          <Text className="font-script text-3xl text-primary">Unique Gifts</Text>
          <Text className="mt-1 font-sans-medium text-[34px] leading-[38px] text-ink">
            for Every Occasion
          </Text>
          <Text className="mt-4 text-[15px] leading-relaxed text-muted">
            Delivering quality gifts, curated collections and personalised keepsakes — everything
            you need to make someone smile.
          </Text>
          <Pressable
            onPress={() => router.push("/shop")}
            className="mt-6 self-start rounded-full bg-primary px-8 py-3.5"
          >
            <Text className="font-sans-medium text-xs uppercase tracking-wide text-white">Shop Now</Text>
          </Pressable>
          <View className="mt-8 aspect-[4/3] w-full overflow-hidden rounded-3xl">
            <Image
              source={{ uri: "https://picsum.photos/seed/hero-gift/1200/960" }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
        </View>

        {/* Shop by occasion — admin-configured, so this section simply
            renders nothing when there are no active occasions to show. */}
        {occasions.length > 0 && (
          <View className="border-t border-line py-10">
            <SectionHeading eyebrow="Shop by Occasion" title="Gifts for the Moment" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 16, paddingHorizontal: 20, paddingTop: 24 }}
            >
              {occasions.map((occasion) => (
                <Pressable
                  key={occasion.slug}
                  onPress={() => router.push(`/occasions/${occasion.slug}`)}
                  style={{ width: OCCASION_CARD_WIDTH }}
                  className="overflow-hidden rounded-2xl bg-cream"
                >
                  <View className="aspect-[4/3] w-full">
                    {occasion.bannerImage && (
                      <Image
                        source={{ uri: occasion.bannerImage }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    )}
                    <View className="absolute inset-0 bg-black/25" />
                    <View className="absolute inset-x-0 bottom-0 p-4">
                      <Text className="font-sans-medium text-base text-white">{occasion.name}</Text>
                      {occasion.tagline && (
                        <Text numberOfLines={1} className="mt-0.5 text-xs text-white/90">
                          {occasion.tagline}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured products */}
        <View className="py-10">
          <SectionHeading eyebrow="Feature Items" title="Top Holiday Gift Ideas" />

          {featured === null ? (
            <ActivityIndicator color={colors.primary} className="mt-10" />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 16, paddingHorizontal: 20, paddingTop: 24 }}
            >
              {featured.map((product) => (
                <ProductCard key={product.slug} product={product} width={CARD_WIDTH} />
              ))}
            </ScrollView>
          )}

          <Pressable
            onPress={() => router.push("/shop")}
            className="mx-auto mt-8 rounded-full border border-ink px-8 py-3"
          >
            <Text className="font-sans-medium text-xs uppercase tracking-wide text-ink">
              View All Products
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
