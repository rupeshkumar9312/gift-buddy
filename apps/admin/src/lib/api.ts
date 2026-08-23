const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const API_BASE = `${API_URL}/api/v1`;

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  permissions: string[];
};

export type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(", ");
    if (body.message) return body.message;
  } catch {
    // fall through to generic message
  }
  return `Request failed with status ${res.status}`;
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit & { accessToken?: string }
): Promise<T> {
  const { accessToken, ...rest } = init ?? {};
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...rest.headers,
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---- Auth ----

export async function adminLogin(email: string, password: string) {
  return apiFetch<{ admin: AdminUser; accessToken: string; loginActivityId?: number }>(
    "/admin/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
}

export async function adminRefresh() {
  return apiFetch<{ admin: AdminUser; accessToken: string }>("/admin/auth/refresh", {
    method: "POST",
  });
}

export async function adminLogout(accessToken: string) {
  return apiFetch<{ success: boolean }>("/admin/auth/logout", {
    method: "POST",
    accessToken,
  });
}

export async function attachAdminLoginLocation(
  accessToken: string,
  loginActivityId: number,
  coords: { latitude: number; longitude: number }
) {
  return apiFetch<{ success: boolean }>(`/admin/auth/login-activity/${loginActivityId}/location`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(coords),
  });
}

// ---- Login activity (audit log) ----

export type LoginActivity = {
  id: number;
  actorType: "customer" | "admin";
  actorName: string | null;
  actorEmail: string | null;
  method: string;
  ipAddress: string;
  userAgent: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  locationSource: string | null;
  createdAt: string;
};

export async function getLoginActivity(accessToken: string, page = 1, limit = 25) {
  return apiFetch<Paginated<LoginActivity>>(
    `/admin/login-activity?page=${page}&limit=${limit}`,
    { accessToken }
  );
}

// ---- Dashboard ----

export type DashboardSummary = {
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
  lowStockProducts: { id: number; name: string; slug: string; stockQty: number }[];
  recentOrders: {
    orderNumber: string;
    email: string;
    status: string;
    total: number;
    currency: string;
    createdAt: string;
  }[];
};

export async function getDashboard(accessToken: string) {
  return apiFetch<DashboardSummary>("/admin/dashboard", { accessToken });
}

// ---- Categories ----

export type AdminCategory = {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  parentId: number | null;
  sortOrder: number;
  productCount: number;
};

export type CategoryInput = {
  slug: string;
  name: string;
  imageUrl?: string;
  parentId?: number | null;
  sortOrder?: number;
};

export async function getCategories(accessToken: string) {
  return apiFetch<AdminCategory[]>("/admin/categories", { accessToken });
}

export async function createCategory(accessToken: string, input: CategoryInput) {
  return apiFetch<AdminCategory>("/admin/categories", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function updateCategory(
  accessToken: string,
  id: number,
  input: Partial<CategoryInput>
) {
  return apiFetch<AdminCategory>(`/admin/categories/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function deleteCategory(accessToken: string, id: number) {
  return apiFetch<void>(`/admin/categories/${id}`, { method: "DELETE", accessToken });
}

// ---- Occasions ----

export type AdminOccasion = {
  id: number;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  bannerImage: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  sortOrder: number;
  categoryIds: number[];
  categories: { id: number; slug: string; name: string }[];
  productIds: number[];
  products: { id: number; slug: string; name: string }[];
  occasionCategories: {
    id: number;
    name: string;
    slug: string;
    sortOrder: number;
    productIds: number[];
  }[];
};

export type OccasionCategoryInput = {
  slug: string;
  name: string;
  sortOrder?: number;
  productIds?: number[];
};

export type OccasionInput = {
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  bannerImageUrl?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  categoryIds?: number[];
  productIds?: number[];
};

export async function getOccasions(accessToken: string) {
  return apiFetch<AdminOccasion[]>("/admin/occasions", { accessToken });
}

export async function createOccasion(accessToken: string, input: OccasionInput) {
  return apiFetch<AdminOccasion>("/admin/occasions", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function updateOccasion(
  accessToken: string,
  id: number,
  input: Partial<OccasionInput>
) {
  return apiFetch<AdminOccasion>(`/admin/occasions/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function deleteOccasion(accessToken: string, id: number) {
  return apiFetch<void>(`/admin/occasions/${id}`, { method: "DELETE", accessToken });
}

export async function createOccasionCategory(
  accessToken: string,
  occasionId: number,
  input: OccasionCategoryInput
) {
  return apiFetch<AdminOccasion>(`/admin/occasions/${occasionId}/categories`, {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function updateOccasionCategory(
  accessToken: string,
  occasionId: number,
  categoryId: number,
  input: Partial<OccasionCategoryInput>
) {
  return apiFetch<AdminOccasion>(`/admin/occasions/${occasionId}/categories/${categoryId}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function deleteOccasionCategory(
  accessToken: string,
  occasionId: number,
  categoryId: number
) {
  return apiFetch<AdminOccasion>(`/admin/occasions/${occasionId}/categories/${categoryId}`, {
    method: "DELETE",
    accessToken,
  });
}

// ---- Products ----

export type AdminProductSummary = {
  id: number;
  slug: string;
  sku: string;
  name: string;
  price: number;
  salePrice: number | null;
  categoryId: number;
  categoryName: string;
  stockQty: number;
  isFeatured: boolean;
  isActive: boolean;
  image: string | null;
  returnDays: number | null;
};

export type AdminProductDetail = AdminProductSummary & {
  description: string;
  ratingAvg: number;
  ratingCount: number;
  images: { url: string; altText: string | null }[];
};

export type ProductInput = {
  slug: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  categoryId: number;
  stockQty: number;
  isFeatured?: boolean;
  isActive?: boolean;
  returnDays?: number | null;
  images?: { url: string; altText?: string }[];
};

export type ProductQuery = {
  search?: string;
  categoryId?: number;
  includeInactive?: boolean;
  page?: number;
  limit?: number;
};

export async function getProducts(accessToken: string, query: ProductQuery = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.categoryId) params.set("categoryId", String(query.categoryId));
  if (query.includeInactive) params.set("includeInactive", "true");
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));

  return apiFetch<Paginated<AdminProductSummary>>(`/admin/products?${params.toString()}`, {
    accessToken,
  });
}

export async function getProduct(accessToken: string, id: number) {
  return apiFetch<AdminProductDetail>(`/admin/products/${id}`, { accessToken });
}

export async function createProduct(accessToken: string, input: ProductInput) {
  return apiFetch<AdminProductDetail>("/admin/products", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function updateProduct(
  accessToken: string,
  id: number,
  input: Partial<ProductInput>
) {
  return apiFetch<AdminProductDetail>(`/admin/products/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function deleteProduct(accessToken: string, id: number) {
  return apiFetch<void>(`/admin/products/${id}`, { method: "DELETE", accessToken });
}

// ---- Orders ----

export type AdminOrderSummary = {
  id: number;
  orderNumber: string;
  email: string;
  phone: string | null;
  status: string;
  total: number;
  currency: string;
  itemCount: number;
  paymentProvider: string | null;
  paymentStatus: string | null;
  createdAt: string;
};

export type AdminOrderDetail = AdminOrderSummary & {
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    line1: string;
    line2: string | null;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    phone: string | null;
  };
  billingAddress: AdminOrderDetail["shippingAddress"];
  shippingMethodName: string;
  placedAt: string | null;
  items: {
    productName: string;
    productSlug: string | null;
    productImage: string | null;
    sku: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
  statusHistory: {
    fromStatus: string | null;
    toStatus: string;
    note: string | null;
    createdAt: string;
  }[];
};

export async function getOrders(
  accessToken: string,
  query: { status?: string; page?: number; limit?: number } = {}
) {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));

  return apiFetch<Paginated<AdminOrderSummary>>(`/admin/orders?${params.toString()}`, {
    accessToken,
  });
}

export async function getOrder(accessToken: string, id: number) {
  return apiFetch<AdminOrderDetail>(`/admin/orders/${id}`, { accessToken });
}

export async function updateOrderStatus(
  accessToken: string,
  id: number,
  status: string,
  note?: string
) {
  return apiFetch<AdminOrderDetail>(`/admin/orders/${id}/status`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify({ status, note }),
  });
}

export async function markCodCollected(accessToken: string, id: number) {
  return apiFetch<AdminOrderDetail>(`/admin/orders/${id}/mark-cod-collected`, {
    method: "POST",
    accessToken,
  });
}

export type CreateAdminOrderInput = {
  email: string;
  shippingAddress: {
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
  items: { productId: number; quantity: number }[];
  shippingMethodId: number;
  paymentMethod: "cod" | "paid";
  note?: string;
};

export async function createAdminOrder(accessToken: string, input: CreateAdminOrderInput) {
  return apiFetch<AdminOrderDetail>("/admin/orders", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

// Public endpoint — the same shipping methods customers see at checkout,
// reused here so a phone/walk-in order picks from the same list.
export type ShippingMethod = {
  id: number;
  name: string;
  price: number;
  freeOverAmount: number | null;
};

export async function getShippingMethods() {
  return apiFetch<ShippingMethod[]>("/shipping-methods");
}

// ---- Coupons ----

export type Coupon = {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: string;
  minSubtotal: string;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  timesUsed: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CouponInput = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal?: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  isActive?: boolean;
};

export async function getCoupons(accessToken: string) {
  return apiFetch<Coupon[]>("/admin/coupons", { accessToken });
}

export async function createCoupon(accessToken: string, input: CouponInput) {
  return apiFetch<Coupon>("/admin/coupons", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function updateCoupon(accessToken: string, id: number, input: Partial<CouponInput>) {
  return apiFetch<Coupon>(`/admin/coupons/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function deleteCoupon(accessToken: string, id: number) {
  return apiFetch<void>(`/admin/coupons/${id}`, { method: "DELETE", accessToken });
}

// ---- Societies ----

export type Society = {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SocietyInput = {
  name: string;
  isActive?: boolean;
};

export async function getSocieties(accessToken: string) {
  return apiFetch<Society[]>("/admin/societies", { accessToken });
}

export async function createSociety(accessToken: string, input: SocietyInput) {
  return apiFetch<Society>("/admin/societies", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function updateSociety(accessToken: string, id: number, input: Partial<SocietyInput>) {
  return apiFetch<Society>(`/admin/societies/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function deleteSociety(accessToken: string, id: number) {
  return apiFetch<void>(`/admin/societies/${id}`, { method: "DELETE", accessToken });
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
  phone: string | null;
};

export type OutOfAreaOrderItem = {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
};

export type OutOfAreaOrder = {
  id: number;
  email: string;
  address: OutOfAreaOrderAddress;
  items: OutOfAreaOrderItem[];
  subtotal: string;
  createdAt: string;
};

export async function getOutOfAreaOrders(accessToken: string) {
  return apiFetch<OutOfAreaOrder[]>("/admin/out-of-area-orders", { accessToken });
}

export async function deleteOutOfAreaOrder(accessToken: string, id: number) {
  return apiFetch<void>(`/admin/out-of-area-orders/${id}`, { method: "DELETE", accessToken });
}

// ---- Reviews ----

export type AdminReview = {
  id: number;
  rating: number;
  title: string;
  body: string;
  isApproved: boolean;
  isFeatured: boolean;
  authorName: string;
  productName: string;
  productSlug: string;
  createdAt: string;
};

export async function getReviews(
  accessToken: string,
  query: { isApproved?: boolean; page?: number; limit?: number } = {}
) {
  const params = new URLSearchParams();
  if (query.isApproved !== undefined) params.set("isApproved", String(query.isApproved));
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));
  return apiFetch<Paginated<AdminReview>>(`/admin/reviews?${params.toString()}`, { accessToken });
}

export async function updateReview(
  accessToken: string,
  id: number,
  input: { isApproved?: boolean; isFeatured?: boolean }
) {
  return apiFetch<AdminReview>(`/admin/reviews/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(input),
  });
}

// ---- Blog ----

export type AdminBlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  coverAsset: { url: string } | null;
  authorAdmin: { name: string } | null;
};

export type BlogPostInput = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  status?: "draft" | "published";
};

export async function getBlogPosts(accessToken: string) {
  return apiFetch<AdminBlogPost[]>("/admin/blog", { accessToken });
}

export async function getBlogPost(accessToken: string, id: number) {
  return apiFetch<AdminBlogPost>(`/admin/blog/${id}`, { accessToken });
}

export async function createBlogPost(accessToken: string, input: BlogPostInput) {
  return apiFetch<AdminBlogPost>("/admin/blog", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function updateBlogPost(
  accessToken: string,
  id: number,
  input: Partial<BlogPostInput>
) {
  return apiFetch<AdminBlogPost>(`/admin/blog/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function deleteBlogPost(accessToken: string, id: number) {
  return apiFetch<void>(`/admin/blog/${id}`, { method: "DELETE", accessToken });
}

// ---- FAQs ----

export type AdminFaq = {
  id: number;
  group: "shipping" | "returns" | "orders";
  question: string;
  answer: string;
  sortOrder: number;
};

export type FaqInput = {
  group: "shipping" | "returns" | "orders";
  question: string;
  answer: string;
  sortOrder?: number;
};

export async function getFaqs(accessToken: string) {
  return apiFetch<AdminFaq[]>("/admin/faqs", { accessToken });
}

export async function createFaq(accessToken: string, input: FaqInput) {
  return apiFetch<AdminFaq>("/admin/faqs", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function updateFaq(accessToken: string, id: number, input: Partial<FaqInput>) {
  return apiFetch<AdminFaq>(`/admin/faqs/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function deleteFaq(accessToken: string, id: number) {
  return apiFetch<void>(`/admin/faqs/${id}`, { method: "DELETE", accessToken });
}

// ---- Contact messages ----

export type AdminContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: string;
};

export async function getContactMessages(accessToken: string) {
  return apiFetch<AdminContactMessage[]>("/admin/contact-messages", { accessToken });
}

export async function updateContactMessage(
  accessToken: string,
  id: number,
  status: "new" | "read" | "replied"
) {
  return apiFetch<AdminContactMessage>(`/admin/contact-messages/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify({ status }),
  });
}

// ---- Media upload ----

export type UploadedImage = { url: string; width: number; height: number };

// Not routed through apiFetch — a multipart upload needs the browser to set
// its own Content-Type with boundary, which apiFetch's hardcoded
// "application/json" header would clobber.
export async function uploadImage(accessToken: string, file: File): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/admin/media/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return res.json() as Promise<UploadedImage>;
}

// ---- Home hero ----

export type AdminHomeHero = {
  eyebrow: string | null;
  heading: string;
  description: string | null;
  primaryCtaLabel: string | null;
  primaryCtaHref: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  bannerImage: string | null;
};

export type HomeHeroInput = {
  eyebrow?: string;
  heading?: string;
  description?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  bannerImageUrl?: string;
};

export async function getHomeHero(accessToken: string) {
  return apiFetch<AdminHomeHero>("/admin/home-hero", { accessToken });
}

export async function updateHomeHero(accessToken: string, input: HomeHeroInput) {
  return apiFetch<AdminHomeHero>("/admin/home-hero", {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(input),
  });
}

// ---- Promo banners ----

export type AdminPromoBanner = {
  id: number;
  eyebrow: string | null;
  heading: string;
  subtitle: string | null;
  ctaLabel: string;
  ctaHref: string;
  bannerImage: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type PromoBannerInput = {
  eyebrow?: string;
  heading?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  bannerImageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export async function getPromoBanners(accessToken: string) {
  return apiFetch<AdminPromoBanner[]>("/admin/promo-banners", { accessToken });
}

export async function createPromoBanner(accessToken: string, input: PromoBannerInput) {
  return apiFetch<AdminPromoBanner>("/admin/promo-banners", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function updatePromoBanner(
  accessToken: string,
  id: number,
  input: Partial<PromoBannerInput>,
) {
  return apiFetch<AdminPromoBanner>(`/admin/promo-banners/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function deletePromoBanner(accessToken: string, id: number) {
  return apiFetch<void>(`/admin/promo-banners/${id}`, { method: "DELETE", accessToken });
}

// ---- Sale banners ----

export type AdminSaleBanner = {
  id: number;
  badge: string | null;
  heading: string;
  subtitle: string | null;
  note: string | null;
  ctaLabel: string;
  ctaHref: string;
  bannerImage: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type SaleBannerInput = {
  badge?: string;
  heading?: string;
  subtitle?: string;
  note?: string;
  ctaLabel?: string;
  ctaHref?: string;
  bannerImageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export async function getSaleBanners(accessToken: string) {
  return apiFetch<AdminSaleBanner[]>("/admin/sale-banners", { accessToken });
}

export async function createSaleBanner(accessToken: string, input: SaleBannerInput) {
  return apiFetch<AdminSaleBanner>("/admin/sale-banners", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function updateSaleBanner(
  accessToken: string,
  id: number,
  input: Partial<SaleBannerInput>,
) {
  return apiFetch<AdminSaleBanner>(`/admin/sale-banners/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function deleteSaleBanner(accessToken: string, id: number) {
  return apiFetch<void>(`/admin/sale-banners/${id}`, { method: "DELETE", accessToken });
}

// ---- Gift kits ----

export type AdminGiftKit = {
  id: number;
  title: string;
  subtitle: string | null;
  href: string;
  bannerImage: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type GiftKitInput = {
  title?: string;
  subtitle?: string;
  href?: string;
  bannerImageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export async function getGiftKits(accessToken: string) {
  return apiFetch<AdminGiftKit[]>("/admin/gift-kits", { accessToken });
}

export async function createGiftKit(accessToken: string, input: GiftKitInput) {
  return apiFetch<AdminGiftKit>("/admin/gift-kits", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function updateGiftKit(
  accessToken: string,
  id: number,
  input: Partial<GiftKitInput>,
) {
  return apiFetch<AdminGiftKit>(`/admin/gift-kits/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(input),
  });
}

export async function deleteGiftKit(accessToken: string, id: number) {
  return apiFetch<void>(`/admin/gift-kits/${id}`, { method: "DELETE", accessToken });
}
