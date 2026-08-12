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
  return apiFetch<{ admin: AdminUser; accessToken: string }>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
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
  status: string;
  total: number;
  currency: string;
  itemCount: number;
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
