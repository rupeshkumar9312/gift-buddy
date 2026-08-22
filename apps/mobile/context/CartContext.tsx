import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  addCartItem,
  applyCoupon as applyCouponApi,
  getCart,
  removeCartItem,
  removeCoupon as removeCouponApi,
  updateCartItem,
  type Cart,
  type CartItem,
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

type CartContextValue = {
  lines: CartLine[];
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

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

  const addToCart = async (productId: number, quantity = 1) => {
    setCart(await addCartItem(productId, quantity, accessToken));
  };

  const removeFromCart = async (productId: number) => {
    setCart(await removeCartItem(productId, accessToken));
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) {
      return removeFromCart(productId);
    }
    setCart(await updateCartItem(productId, quantity, accessToken));
  };

  const refreshCart = async () => {
    setCart(await getCart(accessToken));
  };

  const applyCoupon = async (code: string) => {
    setCart(await applyCouponApi(code, accessToken));
  };

  const removeCoupon = async () => {
    setCart(await removeCouponApi(accessToken));
  };

  return (
    <CartContext.Provider
      value={{
        lines: cart.items,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart,
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
