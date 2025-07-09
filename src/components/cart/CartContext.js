// src/components/cart/CartContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!user;

  // Wczytaj koszyk z localStorage lub API
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (isLoggedIn) {
        try {
          const res = await fetch("/api/cart", { credentials: "include" });
          const data = await res.json();
          setItems(data.items || []);
        } catch {
          setItems([]);
        }
      } else {
        const local = localStorage.getItem("cart");
        setItems(local ? JSON.parse(local) : []);
      }
      setLoading(false);
    };

    loadCart();
  }, [isLoggedIn]);

  // Po zalogowaniu — połącz koszyki
  useEffect(() => {
    const mergeCart = async () => {
      if (!isLoggedIn) return;
      const localCart = localStorage.getItem("cart");
      if (!localCart) return;

      const itemsToMerge = JSON.parse(localCart);
      for (const item of itemsToMerge) {
        await fetch("/api/cart", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.product.id,
            quantity: item.quantity,
          }),
        });
      }

      localStorage.removeItem("cart");

      const res = await fetch("/api/cart", { credentials: "include" });
      const merged = await res.json();
      setItems(merged.items || []);
    };

    mergeCart();
  }, [isLoggedIn]);

  // Zapisywanie zmian do localStorage (dla gościa)
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isLoggedIn]);

  // 🔧 Metody pomocnicze
  const addItem = async (product, quantity = 1) => {
    const existing = items.find((i) => i.product.id === product.id);
    const newItems = existing
      ? items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      : [...items, { product, quantity }];

    setItems(newItems);

    if (isLoggedIn) {
      await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
    }
  };

  const removeItem = async (productId) => {
    setItems(items.filter((i) => i.product.id !== productId));
    if (isLoggedIn) {
      await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
    }
  };

  const clearCart = async () => {
    setItems([]);
    if (isLoggedIn) {
      await fetch("/api/cart", {
        method: "DELETE",
        credentials: "include",
      });
    } else {
      localStorage.removeItem("cart");
    }
  };

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, loading }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
