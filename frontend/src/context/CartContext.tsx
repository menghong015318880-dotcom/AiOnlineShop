"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "@/types";

const STORAGE_KEY = "smartshop-cart";

interface CartContextValue {
  items: CartItem[];
  count: number;    // total number of units (shown in the header badge)
  ready: boolean;   // false until the saved cart is loaded from the browser
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  removeMany: (productIds: number[]) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// Keeps the cart for the whole site. Later, replace the localStorage code
// with calls to the Laravel API (/api/cart); the pages stay the same.
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Load the saved cart once, in the browser
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // Broken or blocked storage: start with an empty cart
    }
    setReady(true);
  }, []);

  // Save the cart every time it changes (only after the first load)
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or blocked: ignore
    }
  }, [items, ready]);

  // Add a product, or increase its quantity. Never more than the stock.
  const addItem = useCallback((product: Product, quantity = 1) => {
    if (product.stock <= 0) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id
            ? { ...i, stock: product.stock, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          old_price: product.old_price,
          image_url: product.image_url,
          stock: product.stock,
          quantity: Math.min(quantity, product.stock),
        },
      ];
    });
  }, []);

  // Set a quantity between 1 and the stock
  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product_id === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i
      )
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  const removeMany = useCallback((productIds: number[]) => {
    setItems((prev) => prev.filter((i) => !productIds.includes(i.product_id)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, count, ready, addItem, updateQuantity, removeItem, removeMany, clear }),
    [items, count, ready, addItem, updateQuantity, removeItem, removeMany, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Use this hook in any client component: const { items, addItem } = useCart();
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}