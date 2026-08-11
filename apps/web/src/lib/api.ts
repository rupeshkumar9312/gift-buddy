import type { Category, Product } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

type ApiCategory = {
  slug: string;
  name: string;
  image: string | null;
  count: number;
};

type ApiProduct = {
  slug: string;
  name: string;
  price: number;
  salePrice: number | null;
  image: string | null;
  image2: string | null;
  rating: number;
  reviews: number;
  category: string;
  badge: "sale" | "new" | "hot" | null;
  description: string;
  sku: string;
  inStock: boolean;
  gallery: string[];
};

type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type ProductQuery = {
  category?: string;
  minRating?: number;
  maxPrice?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "name";
  page?: number;
  limit?: number;
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GiftBuddy API ${path} responded ${res.status}`);
  }

  return res.json() as Promise<T>;
}

function toCategory(category: ApiCategory): Category {
  return {
    slug: category.slug,
    name: category.name,
    image: category.image ?? "",
    count: category.count,
  };
}

function toProduct(product: ApiProduct): Product {
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    salePrice: product.salePrice ?? undefined,
    image: product.image ?? "",
    image2: product.image2 ?? undefined,
    rating: product.rating,
    reviews: product.reviews,
    category: product.category,
    badge: product.badge ?? undefined,
    description: product.description,
    sku: product.sku,
    inStock: product.inStock,
    gallery: product.gallery,
  };
}

export async function getCategories(): Promise<Category[]> {
  const categories = await apiFetch<ApiCategory[]>("/categories");
  return categories.map(toCategory);
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.minRating) params.set("minRating", String(query.minRating));
  if (query.maxPrice) params.set("maxPrice", String(query.maxPrice));
  if (query.sort) params.set("sort", query.sort);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 100));

  const result = await apiFetch<Paginated<ApiProduct>>(`/products?${params.toString()}`);
  return result.data.map(toProduct);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await apiFetch<ApiProduct[]>(`/products/featured?limit=${limit}`);
  return products.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const product = await apiFetch<ApiProduct>(`/products/${slug}`);
    return toProduct(product);
  } catch {
    return null;
  }
}

export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  const products = await apiFetch<ApiProduct[]>(`/products/${slug}/related?limit=${limit}`);
  return products.map(toProduct);
}
