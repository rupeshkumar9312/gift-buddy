import { WishlistItem } from './entities/wishlist-item.entity';

export type WishlistItemResponse = {
  productId: number;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  salePrice: number | null;
  inStock: boolean;
  addedAt: string;
};

export function toWishlistResponse(
  items: WishlistItem[],
): WishlistItemResponse[] {
  return items.map((item) => ({
    productId: item.productId,
    slug: item.product.slug,
    name: item.product.name,
    image: item.product.images?.[0]?.asset?.url ?? null,
    price: Number(item.product.price),
    salePrice: item.product.salePrice ? Number(item.product.salePrice) : null,
    inStock: item.product.inStock,
    addedAt: item.addedAt.toISOString(),
  }));
}
