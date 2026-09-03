import { useState, useEffect, useMemo } from 'react';
import type { CartItem, Product } from '../types/product';

const CART_STORAGE_KEY = 'accesorios_lilis_cart_v1';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('No se pudo guardar el carrito en localStorage', e);
    }
  }, [cart]);

  const addToCart = (product: Product): boolean => {
    const maxStock = typeof product.stock === 'number' ? Math.max(0, product.stock) : 999;
    if (maxStock <= 0) {
      return false;
    }

    let wasAdded = false;
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= maxStock) {
          wasAdded = false;
          return current;
        }
        wasAdded = true;
        return current.map((item) =>
          item.id === product.id
            ? { ...item, stock: product.stock, quantity: Math.min(item.quantity + 1, maxStock) }
            : item,
        );
      }
      wasAdded = true;
      return [...current, { ...product, quantity: 1 }];
    });

    setIsCartOpen(true);
    return wasAdded;
  };

  const removeFromCart = (id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item;
          const maxStock = typeof item.stock === 'number' ? Math.max(0, item.stock) : 999;
          const newQty =
            delta > 0
              ? Math.min(item.quantity + delta, maxStock)
              : Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const getItemQuantity = (id: string) => {
    const found = cart.find((item) => item.id === id);
    return found ? found.quantity : 0;
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [cart],
  );

  return {
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    getItemQuantity,
    clearCart,
    cartCount,
    cartTotal,
  };
}
