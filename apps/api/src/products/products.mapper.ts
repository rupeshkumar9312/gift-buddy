import { Product } from './entities/product.entity';

export type ProductResponse = {
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
  badge: 'sale' | 'new' | 'hot' | null;
  description: string;
  sku: string;
  inStock: boolean;
  gallery: string[];
  returnDays: number | null;
  deliveryEstimateDays: number | null;
};

export function toProductResponse(product: Product): ProductResponse {
  const images = [...(product.images ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const gallery = images.map((image) => image.asset.url);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    image: gallery[0] ?? null,
    image2: gallery[1] ?? null,
    rating: Number(product.ratingAvg),
    reviews: product.ratingCount,
    category: product.category?.slug,
    badge: product.badge,
    description: product.description,
    sku: product.sku,
    inStock: product.inStock,
    gallery,
    returnDays: product.returnDays,
    deliveryEstimateDays: product.deliveryEstimateDays,
  };
}
