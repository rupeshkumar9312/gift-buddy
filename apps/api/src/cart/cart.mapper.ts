import { CartItem } from './entities/cart-item.entity';

export type CartItemResponse = {
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
  deliveryEstimateDays: number | null;
};

export type CartResponse = {
  id: number | null;
  items: CartItemResponse[];
  subtotal: number;
  itemCount: number;
  couponCode: string | null;
  discountTotal: number;
  total: number;
};

export function toCartItemResponse(item: CartItem): CartItemResponse {
  const product = item.product;
  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const effectivePrice = salePrice ?? price;
  const images = [...(product.images ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: images[0]?.asset?.url ?? null,
    price,
    salePrice,
    quantity: item.quantity,
    inStock: product.stockQty > 0,
    stockQty: product.stockQty,
    lineTotal: Math.round(effectivePrice * item.quantity * 100) / 100,
    deliveryEstimateDays: product.deliveryEstimateDays,
  };
}

export function toCartResponse(
  cartId: number | null,
  items: CartItem[],
  coupon: { code: string; discount: number } | null = null,
): CartResponse {
  const lines = items.map(toCartItemResponse);
  const subtotal =
    Math.round(lines.reduce((sum, l) => sum + l.lineTotal, 0) * 100) / 100;
  const discountTotal = coupon ? Math.min(coupon.discount, subtotal) : 0;
  return {
    id: cartId,
    items: lines,
    subtotal,
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    couponCode: coupon?.code ?? null,
    discountTotal,
    total: Math.round((subtotal - discountTotal) * 100) / 100,
  };
}
