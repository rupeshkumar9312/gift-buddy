import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { getCategories, getProducts } from "@/lib/api";
import type { Category, Product } from "@/lib/types";

export default function ShopScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    getProducts({ limit: 100 })
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <CatalogBrowser
        header={<ScreenHeader title="Shop" subtitle="Browse the full collection" />}
        categories={categories}
        products={products}
      />
    </SafeAreaView>
  );
}
