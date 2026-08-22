"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { StarRating } from "@/components/StarRating";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/format";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

// occasionCategorySlugs is optional and only ever populated by the
// /occasions/[slug] page — a per-occasion tag layer, distinct from the
// product's real `category`, that /shop itself never supplies.
type ShopProduct = Product & { occasionCategorySlugs?: string[] };

export function ShopPageClient({
  categories,
  products,
}: {
  categories: Category[];
  products: ShopProduct[];
}) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200);
  const [sortBy, setSortBy] = useState<SortKey>("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { addToCart } = useCart();

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinRating(0);
    setMaxPrice(200);
  };

  const filtered = useMemo(() => {
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

  const activeFilterCount = selectedCategories.length + (minRating > 0 ? 1 : 0) + (maxPrice < 200 ? 1 : 0);

  const filterPanel = (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">Category</h3>
        <ul className="flex flex-col gap-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <label className="flex cursor-pointer items-center justify-between gap-2 text-sm text-muted">
                <span className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.slug)}
                    onChange={() => toggleCategory(category.slug)}
                    className="h-4 w-4 rounded border-line accent-[#be7374]"
                  />
                  <span className="text-ink">{category.name}</span>
                </span>
                <span className="text-xs">{category.count}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">Max Price</h3>
        <input
          type="range"
          min={10}
          max={200}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#be7374]"
        />
        <div className="mt-2 flex justify-between text-sm text-muted">
          <span>{formatMoney(10)}</span>
          <span className="font-medium text-ink">{formatMoney(maxPrice)}</span>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">Rating</h3>
        <ul className="flex flex-col gap-2.5">
          {[4, 3, 2, 0].map((rating) => (
            <li key={rating}>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === rating}
                  onChange={() => setMinRating(rating)}
                  className="h-4 w-4 accent-[#be7374]"
                />
                {rating === 0 ? (
                  <span className="text-ink">Any rating</span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <StarRating rating={rating} />
                    <span className="text-muted">&amp; up</span>
                  </span>
                )}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="self-start text-sm font-medium text-primary underline underline-offset-4"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container-page py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">{filterPanel}</aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
            <p className="text-sm text-muted">
              Showing <span className="font-medium text-ink">{filtered.length}</span> of{" "}
              {products.length} results
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm lg:hidden"
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
              <div className="hidden items-center gap-1 rounded-full border border-line p-1 sm:flex">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                    view === "grid" ? "bg-primary text-white" : "text-muted"
                  }`}
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="List view"
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                    view === "list" ? "bg-primary text-white" : "text-muted"
                  }`}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="py-20 text-center text-muted">No products match your filters.</p>
          ) : view === "grid" ? (
            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <ul className="mt-10 flex flex-col gap-6">
              {filtered.map((product) => (
                <li key={product.slug} className="flex gap-5 border-b border-line pb-6">
                  <Link href={`/product/${product.slug}`} className="relative h-32 w-28 shrink-0 overflow-hidden rounded-xl bg-cream sm:h-40 sm:w-36">
                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="150px" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <StarRating rating={product.rating} />
                    <Link href={`/product/${product.slug}`} className="mt-1.5 text-base font-medium hover:text-primary">
                      {product.name}
                    </Link>
                    <p className="mt-2 hidden max-w-md text-sm text-muted sm:line-clamp-2 sm:block">
                      {product.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center gap-2 text-sm">
                        {product.salePrice ? (
                          <>
                            <span className="font-semibold text-primary">{formatMoney(product.salePrice)}</span>
                            <span className="text-muted line-through">{formatMoney(product.price)}</span>
                          </>
                        ) : (
                          <span className="font-semibold text-ink">{formatMoney(product.price)}</span>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={!product.inStock}
                        className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-primary disabled:bg-muted"
                      >
                        <ShoppingBag size={13} />
                        {product.inStock ? "Add to Cart" : "Sold Out"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div
        onClick={() => setFiltersOpen(false)}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity lg:hidden ${
          filtersOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-300 lg:hidden ${
          filtersOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium">Filters</h2>
          <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
            <X size={20} />
          </button>
        </div>
        {filterPanel}
      </aside>
    </div>
  );
}
