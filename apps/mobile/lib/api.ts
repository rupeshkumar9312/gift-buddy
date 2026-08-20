import type { Category, Product } from "./types";

// iOS simulator/web reach the host machine via localhost; Android emulator
// needs 10.0.2.2; a physical device needs the machine's LAN IP — see
// .env.example. Same backend as apps/web, just a different base URL source
// (Expo inlines EXPO_PUBLIC_-prefixed vars at build time; Next.js uses
// NEXT_PUBLIC_ for the same purpose).
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

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
// The API tracks a guest cart via an httpOnly cookie (see
// apps/api/src/cart/cart.controller.ts). Unlike a browser, React Native's
// fetch isn't sandboxed by CORS/same-origin rules, and the platform's
// native networking stack (NSURLSession / OkHttp) persists and resends
// cookies automatically — so this works the same way it does on the web
// with no extra cookie-jar plumbing needed.

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
  couponCode: string | null;
  discountTotal: number;
  total: number;
};

// A logged-in user's cart lives behind their account (userId), not the guest
// cookie — every cart call needs the access token when one's available, or
// operations silently drift onto a throwaway guest cart instead of the
// user's real one (see the merge-on-login note in CartContext).
function authHeader(accessToken?: string | null): HeadersInit | undefined {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

export async function getCart(accessToken?: string | null): Promise<Cart> {
  return apiFetch<Cart>("/cart", { headers: authHeader(accessToken) });
}

export async function addCartItem(
  productId: number,
  quantity = 1,
  accessToken?: string | null
): Promise<Cart> {
  return apiFetch<Cart>("/cart/items", {
    method: "POST",
    headers: authHeader(accessToken),
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateCartItem(
  productId: number,
  quantity: number,
  accessToken?: string | null
): Promise<Cart> {
  return apiFetch<Cart>(`/cart/items/${productId}`, {
    method: "PATCH",
    headers: authHeader(accessToken),
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(productId: number, accessToken?: string | null): Promise<Cart> {
  return apiFetch<Cart>(`/cart/items/${productId}`, {
    method: "DELETE",
    headers: authHeader(accessToken),
  });
}

// ---- Coupons (cart) ----

export async function applyCoupon(code: string, accessToken?: string | null): Promise<Cart> {
  return apiFetch<Cart>("/cart/coupon", {
    method: "POST",
    headers: authHeader(accessToken),
    body: JSON.stringify({ code }),
  });
}

export async function removeCoupon(accessToken?: string | null): Promise<Cart> {
  return apiFetch<Cart>("/cart/coupon", { method: "DELETE", headers: authHeader(accessToken) });
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

export async function getCheckoutConfig(): Promise<{ gatewayEnabled: boolean }> {
  return apiFetch<{ gatewayEnabled: boolean }>("/checkout/config");
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
  clientSecret: string | null;
  total: number;
  currency: string;
  devMode: boolean;
  paymentMethod: "card" | "cod";
  publishableKey: string | null;
};

export async function checkout(input: CheckoutInput, accessToken?: string | null): Promise<CheckoutResult> {
  return apiFetch<CheckoutResult>("/checkout", {
    method: "POST",
    headers: authHeader(accessToken),
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

export async function cancelOrder(
  orderNumber: string,
  options: { accessToken?: string; email?: string }
): Promise<OrderDetail> {
  return apiFetch<OrderDetail>(`/orders/${orderNumber}/cancel`, {
    method: "POST",
    headers: authHeader(options.accessToken),
    body: JSON.stringify({ email: options.email }),
  });
}
