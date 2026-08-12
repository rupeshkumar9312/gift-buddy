"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/lib/types";
import { addCartItem, getCart, removeCartItem, updateCartItem, type Cart, type CartItem } from "@/lib/api";
import { useAuth } from "./AuthContext";

export type CartLine = CartItem;

const EMPTY_CART: Cart = { id: null, items: [], subtotal: 0, itemCount: 0 };

type CartContextValue = {
  lines: CartLine[];
  wishlist: Product[];
  isCartOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (slug: string) => boolean;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cart is server-backed: a guest cart lives behind an httpOnly cookie, and
  // logging in merges it into the user's cart — so re-fetch whenever the
  // signed-in user changes (login, logout, or session restore on mount).
  useEffect(() => {
    let cancelled = false;
    getCart()
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
  }, [user?.id]);

  const addToCart = async (product: Product, quantity = 1) => {
    const data = await addCartItem(product.id, quantity);
    setCart(data);
    setCartOpen(true);
  };

  const removeFromCart = async (productId: number) => {
    const data = await removeCartItem(productId);
    setCart(data);
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) {
      return removeFromCart(productId);
    }
    const data = await updateCartItem(productId, quantity);
    setCart(data);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) =>
      prev.some((p) => p.slug === product.slug)
        ? prev.filter((p) => p.slug !== product.slug)
        : [...prev, product]
    );
  };

  const isWishlisted = (slug: string) => wishlist.some((p) => p.slug === slug);

  const refreshCart = async () => {
    const data = await getCart();
    setCart(data);
  };

  return (
    <CartContext.Provider
      value={{
        lines: cart.items,
        wishlist,
        isCartOpen,
        isLoading,
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
