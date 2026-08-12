import type { Category, Product } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

type ApiCategory = {
  slug: string;
  name: string;
  image: string | null;
  count: number;
};

type ApiProduct = {
  id: number;
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

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(", ");
    if (body.message) return body.message;
  } catch {
    // fall through to generic message
  }
  return `GiftBuddy API responded ${res.status}`;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
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
    id: product.id,
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

// ---- Cart ----

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  salePrice: number | null;
  quantity: number;
  inStock: boolean;
  stockQty: number;
  lineTotal: number;
};

export type Cart = {
  id: number | null;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
};

export async function getCart(): Promise<Cart> {
  return apiFetch<Cart>("/cart");
}

export async function addCartItem(productId: number, quantity = 1): Promise<Cart> {
  return apiFetch<Cart>("/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateCartItem(productId: number, quantity: number): Promise<Cart> {
  return apiFetch<Cart>(`/cart/items/${productId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(productId: number): Promise<Cart> {
  return apiFetch<Cart>(`/cart/items/${productId}`, { method: "DELETE" });
}

// ---- Shipping ----

export type ShippingMethod = {
  id: number;
  name: string;
  price: number;
  freeOverAmount: number | null;
};

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  return apiFetch<ShippingMethod[]>("/shipping-methods");
}

// ---- Checkout ----

export type AddressInput = {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone?: string;
};

export type CheckoutInput = {
  email: string;
  shippingAddress: AddressInput;
  billingAddress?: AddressInput;
  shippingMethodId: number;
};

export type CheckoutResult = {
  orderNumber: string;
  clientSecret: string;
  total: number;
  currency: string;
  devMode: boolean;
  publishableKey: string | null;
};

export async function checkout(input: CheckoutInput): Promise<CheckoutResult> {
  return apiFetch<CheckoutResult>("/checkout", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Dev-only bypass for the local payment simulator — see PaymentsService on the API. */
export async function devConfirmPayment(orderNumber: string): Promise<void> {
  await apiFetch(`/checkout/${orderNumber}/dev-confirm`, { method: "POST" });
}

// ---- Orders ----

export type OrderSummary = {
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
};

export type OrderItemDetail = {
  productName: string;
  productSlug: string | null;
  productImage: string | null;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrderStatusEvent = {
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
};

export type OrderDetail = OrderSummary & {
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number;
  shippingAddress: AddressInput;
  billingAddress: AddressInput;
  shippingMethodName: string;
  placedAt: string | null;
  items: OrderItemDetail[];
  statusHistory: OrderStatusEvent[];
};

export async function getOrders(accessToken: string): Promise<Paginated<OrderSummary>> {
  return apiFetch<Paginated<OrderSummary>>("/orders", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getOrder(accessToken: string, orderNumber: string): Promise<OrderDetail> {
  return apiFetch<OrderDetail>(`/orders/${orderNumber}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function trackOrder(orderNumber: string, email: string): Promise<OrderDetail> {
  return apiFetch<OrderDetail>("/orders/track", {
    method: "POST",
    body: JSON.stringify({ orderNumber, email }),
  });
}
