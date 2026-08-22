import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { getOccasion } from "@/lib/api";
import type { OccasionDetail } from "@/lib/api";
import type { Category } from "@/lib/types";
import { colors } from "@/lib/theme";

function OccasionHeader({ occasion }: { occasion: OccasionDetail }) {
  return (
    <View className="border-b border-line bg-cream">
      {occasion.bannerImage && (
        <View className="aspect-[16/7] w-full">
          <Image
            source={{ uri: occasion.bannerImage }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </View>
      )}
      <View className="px-5 py-6">
        <Text className="font-sans-semibold text-2xl text-ink">{occasion.name}</Text>
        {occasion.tagline && (
          <Text className="mt-1 font-script text-xl text-primary">{occasion.tagline}</Text>
        )}
        {occasion.description && (
          <Text className="mt-2 text-sm leading-relaxed text-muted">{occasion.description}</Text>
        )}
      </View>
    </View>
  );
}

export default function OccasionDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [occasion, setOccasion] = useState<OccasionDetail | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;
    getOccasion(slug).then(setOccasion);
  }, [slug]);

  if (occasion === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (occasion === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-sm text-muted">We couldn&apos;t find that occasion.</Text>
      </View>
    );
  }

  // Mirrors apps/web/src/app/occasions/[slug]/page.tsx: the count next to
  // each category is "how many of this occasion's own products are in that
  // category", not the category's global total. c.slug may be either a
  // real category (matched via p.category) or one of this occasion's own
  // otherwise-invisible tags (matched via occasionCategorySlugs).
  const categories: Category[] = occasion.categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    image: "",
    count: occasion.products.filter(
      (p) => p.category === c.slug || p.occasionCategorySlugs.includes(c.slug)
    ).length,
  }));

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <CatalogBrowser
        header={<OccasionHeader occasion={occasion} />}
        categories={categories}
        products={occasion.products}
      />
    </SafeAreaView>
  );
}
