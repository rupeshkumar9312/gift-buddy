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

// ---- Societies ----

export type Society = {
  id: number;
  name: string;
};

export async function getSocieties(): Promise<Society[]> {
  return apiFetch<Society[]>("/societies");
}

// ---- Out-of-area orders ----

export type OutOfAreaOrderAddress = {
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone?: string;
};

export type OutOfAreaOrderItem = {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
};

export type OutOfAreaOrderInput = {
  email: string;
  address: OutOfAreaOrderAddress;
  items: OutOfAreaOrderItem[];
  subtotal: number;
};

export async function submitOutOfAreaOrder(
  input: OutOfAreaOrderInput,
): Promise<{ received: true }> {
  return apiFetch<{ received: true }>("/out-of-area-orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
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

// ---- Reviews ----

export type Review = {
  id: number;
  rating: number;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
};

export type FeaturedReview = Review & {
  productName: string;
  productSlug: string;
};

export async function getProductReviews(
  slug: string,
  page = 1
): Promise<Paginated<Review>> {
  return apiFetch<Paginated<Review>>(`/products/${slug}/reviews?page=${page}`);
}

export async function getFeaturedReviews(limit = 6): Promise<FeaturedReview[]> {
  return apiFetch<FeaturedReview[]>(`/reviews/featured?limit=${limit}`);
}

export async function submitReview(
  slug: string,
  accessToken: string,
  input: { rating: number; title: string; body: string }
): Promise<Review> {
  return apiFetch<Review>(`/products/${slug}/reviews`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(input),
  });
}

// ---- Wishlist ----

export type WishlistItem = {
  productId: number;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  salePrice: number | null;
  inStock: boolean;
  addedAt: string;
};

export async function getWishlist(accessToken: string): Promise<WishlistItem[]> {
  return apiFetch<WishlistItem[]>("/wishlist", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function addWishlistItem(
  accessToken: string,
  productId: number
): Promise<WishlistItem[]> {
  return apiFetch<WishlistItem[]>(`/wishlist/items/${productId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function removeWishlistItem(
  accessToken: string,
  productId: number
): Promise<WishlistItem[]> {
  return apiFetch<WishlistItem[]>(`/wishlist/items/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// ---- Blog ----

export type BlogPostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  authorName: string;
  publishedAt: string | null;
};

export type BlogPostDetail = BlogPostSummary & { content: string };

export async function getBlogPosts(): Promise<BlogPostSummary[]> {
  const result = await apiFetch<Paginated<BlogPostSummary>>("/blog?limit=50");
  return result.data;
}

export async function getBlogPost(slug: string): Promise<BlogPostDetail | null> {
  try {
    return await apiFetch<BlogPostDetail>(`/blog/${slug}`);
  } catch {
    return null;
  }
}

// ---- Occasions ----

export type Occasion = {
  slug: string;
  name: string;
  tagline: string | null;
  bannerImage: string | null;
  startsAt: string | null;
  endsAt: string | null;
};

// occasionCategorySlugs marks which of this occasion's own (per-occasion,
// otherwise-invisible) categories a product is tagged with — distinct
// from the product's real `category`, which drives general site browsing.
export type OccasionProduct = Product & { occasionCategorySlugs: string[] };

export type OccasionDetail = Occasion & {
  description: string | null;
  categories: { slug: string; name: string }[];
  products: OccasionProduct[];
};

export async function getOccasions(): Promise<Occasion[]> {
  return apiFetch<Occasion[]>("/occasions");
}

export async function getOccasion(slug: string): Promise<OccasionDetail | null> {
  try {
    const occasion = await apiFetch<
      Omit<OccasionDetail, "products"> & {
        products: (ApiProduct & { occasionCategorySlugs: string[] })[];
      }
    >(`/occasions/${slug}`);
    return {
      ...occasion,
      products: occasion.products.map((p) => ({
        ...toProduct(p),
        occasionCategorySlugs: p.occasionCategorySlugs,
      })),
    };
  } catch {
    return null;
  }
}

// ---- Home hero ----

export type HomeHero = {
  eyebrow: string | null;
  heading: string;
  description: string | null;
  primaryCtaLabel: string | null;
  primaryCtaHref: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  bannerImage: string | null;
};

export async function getHomeHero(): Promise<HomeHero> {
  return apiFetch<HomeHero>("/home-hero");
}

// ---- Promo banners ----

export type PromoBanner = {
  id: number;
  eyebrow: string | null;
  heading: string;
  subtitle: string | null;
  ctaLabel: string;
  ctaHref: string;
  image: string | null;
};

export async function getPromoBanners(): Promise<PromoBanner[]> {
  return apiFetch<PromoBanner[]>("/promo-banners");
}

// ---- Sale banners ----

export type SaleBanner = {
  id: number;
  badge: string | null;
  heading: string;
  subtitle: string | null;
  note: string | null;
  ctaLabel: string;
  ctaHref: string;
  image: string | null;
};

export async function getSaleBanners(): Promise<SaleBanner[]> {
  return apiFetch<SaleBanner[]>("/sale-banners");
}

// ---- Gift kits ----

export type GiftKit = {
  id: number;
  title: string;
  subtitle: string | null;
  href: string;
  image: string | null;
};

export async function getGiftKits(): Promise<GiftKit[]> {
  return apiFetch<GiftKit[]>("/gift-kits");
}

// ---- FAQs ----

export type FaqItem = { id: number; question: string; answer: string };
export type GroupedFaqs = { shipping: FaqItem[]; returns: FaqItem[]; orders: FaqItem[] };

export async function getFaqs(): Promise<GroupedFaqs> {
  return apiFetch<GroupedFaqs>("/faqs");
}

// ---- Contact & newsletter ----

export async function submitContact(input: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<{ received: true }> {
  return apiFetch<{ received: true }>("/contact", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function subscribeNewsletter(email: string): Promise<{ subscribed: true }> {
  return apiFetch<{ subscribed: true }>("/newsletter", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
