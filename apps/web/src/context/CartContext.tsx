"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/lib/types";
import {
  addCartItem,
  addWishlistItem,
  applyCoupon as applyCouponApi,
  getCart,
  getWishlist,
  removeCartItem,
  removeCoupon as removeCouponApi,
  removeWishlistItem,
  updateCartItem,
  type Cart,
  type CartItem,
  type WishlistItem,
} from "@/lib/api";
import { useAuth } from "./AuthContext";

export type CartLine = CartItem;

const EMPTY_CART: Cart = {
  id: null,
  items: [],
  subtotal: 0,
  itemCount: 0,
  couponCode: null,
  discountTotal: 0,
  total: 0,
};

// The wishlist API only returns a lightweight item shape, not a full Product
// — this backfills the fields ProductCard needs (rating/badge/gallery) with
// neutral defaults so the wishlist page can reuse it without a second card.
function wishlistItemToProduct(item: WishlistItem): Product {
  return {
    id: item.productId,
    slug: item.slug,
    name: item.name,
    price: item.price,
    salePrice: item.salePrice ?? undefined,
    image: item.image ?? "",
    rating: 0,
    reviews: 0,
    category: "",
    description: "",
    sku: "",
    inStock: item.inStock,
    gallery: item.image ? [item.image] : [],
  };
}

type CartContextValue = {
  lines: CartLine[];
  wishlist: Product[];
  isCartOpen: boolean;
  isLoading: boolean;
  isWishlistLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isWishlisted: (productId: number) => boolean;
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  total: number;
  couponCode: string | null;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlistLoading, setIsWishlistLoading] = useState(true);

  // Cart is server-backed: a guest cart lives behind an httpOnly cookie, and
  // logging in merges it into the user's cart — so re-fetch whenever the
  // signed-in user changes (login, logout, or session restore on mount).
  useEffect(() => {
    let cancelled = false;
    getCart(accessToken)
      .then((data) => {
        if (!cancelled) setCart(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, accessToken]);

  // Wishlist is server-backed for signed-in customers only (the API requires
  // login — no guest wishlist token like cart has). Guests fall back to a
  // local, in-memory wishlist that's lost on refresh.
  useEffect(() => {
    let cancelled = false;
    const load = user && accessToken ? getWishlist(accessToken) : Promise.resolve([]);
    load
      .then((items) => {
        if (!cancelled) setWishlist(items.map(wishlistItemToProduct));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsWishlistLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, accessToken]);

  const addToCart = async (product: Product, quantity = 1) => {
    const data = await addCartItem(product.id, quantity, accessToken);
    setCart(data);
    setCartOpen(true);
  };

  const removeFromCart = async (productId: number) => {
    const data = await removeCartItem(productId, accessToken);
    setCart(data);
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) {
      return removeFromCart(productId);
    }
    const data = await updateCartItem(productId, quantity, accessToken);
    setCart(data);
  };

  const toggleWishlist = async (product: Product) => {
    const wishlisted = wishlist.some((p) => p.id === product.id);

    if (user && accessToken) {
      const items = wishlisted
        ? await removeWishlistItem(accessToken, product.id)
        : await addWishlistItem(accessToken, product.id);
      setWishlist(items.map(wishlistItemToProduct));
      return;
    }

    setWishlist((prev) =>
      wishlisted ? prev.filter((p) => p.id !== product.id) : [...prev, product]
    );
  };

  const isWishlisted = (productId: number) => wishlist.some((p) => p.id === productId);

  const refreshCart = async () => {
    const data = await getCart(accessToken);
    setCart(data);
  };

  const applyCoupon = async (code: string) => {
    const data = await applyCouponApi(code, accessToken);
    setCart(data);
  };

  const removeCoupon = async () => {
    const data = await removeCouponApi(accessToken);
    setCart(data);
  };

  return (
    <CartContext.Provider
      value={{
        lines: cart.items,
        wishlist,
        isCartOpen,
        isLoading,
        isWishlistLoading,
        openCart: () => setCartOpen(true),
        closeCart: () => setCartOpen(false),
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart,
        toggleWishlist,
        isWishlisted,
        itemCount: cart.itemCount,
        subtotal: cart.subtotal,
        discountTotal: cart.discountTotal,
        total: cart.total,
        couponCode: cart.couponCode,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
