import { Product } from '../../products/entities/product.entity';

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

function primaryImage(product: Product): string | null {
  const sorted = [...(product.images ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  return sorted[0]?.asset?.url ?? null;
}

export function toAdminProductSummary(product: Product): AdminProductSummary {
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? '',
    stockQty: product.stockQty,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    image: primaryImage(product),
    returnDays: product.returnDays,
  };
}

export function toAdminProductDetail(product: Product): AdminProductDetail {
  const sorted = [...(product.images ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  return {
    ...toAdminProductSummary(product),
    description: product.description,
    ratingAvg: Number(product.ratingAvg),
    ratingCount: product.ratingCount,
    images: sorted.map((img) => ({
      url: img.asset.url,
      altText: img.asset.altText,
    })),
  };
}
