import { ReactNode, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SlidersHorizontal, X } from "lucide-react-native";
import { ProductCard } from "@/components/ProductCard";
import { StarRating } from "@/components/StarRating";
import type { Category, Product } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { colors } from "@/lib/theme";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "name", label: "Name: A to Z" },
];

const MAX_PRICE_CEILING = 200;
const RATING_OPTIONS = [4, 3, 2, 0];

// occasionCategorySlugs is only ever present on products coming from an
// occasion detail screen — the general shop screen's products simply won't
// have it, so the category match below is purely additive there.
export type CatalogProduct = Product & { occasionCategorySlugs?: string[] };

// Shared by the general Shop tab and an occasion's own landing screen, so
// the filter/sort/grid behavior (and the fix for filter labels not
// rendering) only has to live in one place.
export function CatalogBrowser({
  header,
  categories,
  products,
}: {
  header: ReactNode;
  categories: Category[];
  products: CatalogProduct[] | null;
}) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE_CEILING);
  const [sortBy, setSortBy] = useState<SortKey>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) => (prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]));
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinRating(0);
    setMaxPrice(MAX_PRICE_CEILING);
  };

  const filtered = useMemo(() => {
    if (!products) return [];
    let list = products.filter((p) => {
      const price = p.salePrice ?? p.price;
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category) ||
        p.occasionCategorySlugs?.some((slug) => selectedCategories.includes(slug));
      const matchesRating = p.rating >= minRating;
      const matchesPrice = price <= maxPrice;
      return matchesCategory && matchesRating && matchesPrice;
    });

    list = [...list].sort((a, b) => {
      const priceA = a.salePrice ?? a.price;
      const priceB = b.salePrice ?? b.price;
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [products, selectedCategories, minRating, maxPrice, sortBy]);

  const activeFilterCount = selectedCategories.length + (minRating > 0 ? 1 : 0) + (maxPrice < MAX_PRICE_CEILING ? 1 : 0);
  const selectedCategoryNames = categories
    .filter((c) => selectedCategories.includes(c.slug))
    .map((c) => c.name)
    .join(", ");

  return (
    <>
      <FlatList
        data={filtered}
        key="grid-2"
        numColumns={2}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={{ paddingBottom: 20, gap: 24 }}
        columnWrapperStyle={{ gap: 16, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {header}
            {products !== null && (
              <>
                <View className="flex-row items-center justify-between px-5 pb-3 pt-4">
                  <View className="flex-1 pr-3">
                    <Text className="text-xs text-muted">
                      {filtered.length} of {products.length} results
                    </Text>
                    {selectedCategoryNames.length > 0 && (
                      <Text numberOfLines={1} className="mt-0.5 text-xs text-ink">
                        {selectedCategoryNames}
                      </Text>
                    )}
                  </View>
                  <Pressable onPress={() => setFiltersOpen(true)} className="flex-row items-center gap-1.5">
                    <SlidersHorizontal size={13} color={colors.ink} />
                    <Text className="text-xs font-sans-medium uppercase tracking-wide text-ink">
                      Sort &amp; Filter
                    </Text>
                    {activeFilterCount > 0 && (
                      <View className="h-4 w-4 items-center justify-center rounded-full bg-primary">
                        <Text className="text-[10px] text-white">{activeFilterCount}</Text>
                      </View>
                    )}
                  </Pressable>
                </View>
                <View className="mb-4 border-b border-line" />
              </>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard product={item} />
          </View>
        )}
        ListEmptyComponent={
          products === null ? (
            <ActivityIndicator color={colors.primary} className="mt-10" />
          ) : (
            <Text className="mt-10 text-center text-sm text-muted">No products match your filters.</Text>
          )
        }
      />

      <Modal visible={filtersOpen} animationType="slide" transparent onRequestClose={() => setFiltersOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setFiltersOpen(false)} />
        <View className="max-h-[85%] rounded-t-3xl bg-white px-6 pb-8 pt-5">
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="font-sans-medium text-lg text-ink">Sort &amp; Filter</Text>
            <Pressable onPress={() => setFiltersOpen(false)}>
              <X size={20} color={colors.ink} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="mb-3 text-sm font-sans-semibold uppercase tracking-wide text-muted">Category</Text>
            <View className="flex-col gap-2.5">
              {categories.map((category) => {
                const checked = selectedCategories.includes(category.slug);
                return (
                  <Pressable
                    key={category.slug}
                    onPress={() => toggleCategory(category.slug)}
                    className="flex-row items-center justify-between gap-3 py-1.5"
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`h-4 w-4 items-center justify-center rounded border ${
                          checked ? "border-primary bg-primary" : "border-line"
                        }`}
                      >
                        {checked && <View className="h-2 w-2 rounded-sm bg-white" />}
                      </View>
                      <Text className="text-sm text-ink">{category.name}</Text>
                    </View>
                    <Text className="text-xs text-muted">{category.count}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="mb-3 mt-7 text-sm font-sans-semibold uppercase tracking-wide text-muted">Sort By</Text>
            <View className="flex-col gap-2">
              {SORT_OPTIONS.map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => setSortBy(option.key)}
                  className="flex-row items-center gap-3 py-1.5"
                >
                  <View
                    className={`h-4 w-4 items-center justify-center rounded-full border ${
                      sortBy === option.key ? "border-primary" : "border-line"
                    }`}
                  >
                    {sortBy === option.key && <View className="h-2 w-2 rounded-full bg-primary" />}
                  </View>
                  <Text className="text-sm text-ink">{option.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text className="mb-3 mt-7 text-sm font-sans-semibold uppercase tracking-wide text-muted">
              Max Price: {formatMoney(maxPrice)}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[50, 100, 150, MAX_PRICE_CEILING].map((price) => (
                <Pressable
                  key={price}
                  onPress={() => setMaxPrice(price)}
                  className={`rounded-full border px-4 py-2 ${
                    maxPrice === price ? "border-primary bg-cream" : "border-line"
                  }`}
                >
                  <Text className="text-xs text-ink">
                    {price === MAX_PRICE_CEILING ? "Any" : `Up to ${formatMoney(price)}`}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text className="mb-3 mt-7 text-sm font-sans-semibold uppercase tracking-wide text-muted">Rating</Text>
            <View className="flex-col gap-2.5">
              {RATING_OPTIONS.map((rating) => (
                <Pressable
                  key={rating}
                  onPress={() => setMinRating(rating)}
                  className="flex-row items-center gap-3 py-1.5"
                >
                  <View
                    className={`h-4 w-4 items-center justify-center rounded-full border ${
                      minRating === rating ? "border-primary" : "border-line"
                    }`}
                  >
                    {minRating === rating && <View className="h-2 w-2 rounded-full bg-primary" />}
                  </View>
                  {rating === 0 ? (
                    <Text className="text-sm text-ink">Any rating</Text>
                  ) : (
                    <View className="flex-row items-center gap-1.5">
                      <StarRating rating={rating} />
                      <Text className="text-sm text-muted">&amp; up</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>

            {activeFilterCount > 0 && (
              <Pressable onPress={clearFilters} className="mt-6">
                <Text className="text-sm text-primary">Clear all filters</Text>
              </Pressable>
            )}
          </ScrollView>
          <Pressable
            onPress={() => setFiltersOpen(false)}
            className="mt-6 items-center rounded-full bg-primary py-3.5"
          >
            <Text className="font-sans-medium text-sm uppercase tracking-wide text-white">
              Show {filtered.length} Results
            </Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}
