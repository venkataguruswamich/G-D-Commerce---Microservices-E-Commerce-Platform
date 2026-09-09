import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'wishlist';

// Covers both "Wishlist" and "Saved for Later" from the product spec — the
// backend has no concept distinguishing the two, so a single localStorage
// list backs both surfaces instead of maintaining two parallel systems.
export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      if (prev.some((item) => item.productId === product.id)) return prev;
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          imageUrl: product.imageUrl,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const isWishlisted = useCallback((productId) => items.some((item) => item.productId === productId), [items]);

  const toggleItem = useCallback(
    (product) => {
      if (isWishlisted(product.id)) {
        removeItem(product.id);
      } else {
        addItem(product);
      }
    },
    [isWishlisted, addItem, removeItem]
  );

  const clearWishlist = useCallback(() => setItems([]), []);

  const totalItems = useMemo(() => items.length, [items]);

  const value = { items, addItem, removeItem, toggleItem, isWishlisted, clearWishlist, totalItems };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
