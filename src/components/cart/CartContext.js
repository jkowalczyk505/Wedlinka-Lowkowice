import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!user;

  const mapFromBackend = (data) =>
    (data.items || [])
      .filter((i) => i?.product_id && i?.price_net)
      .map((i) => ({
        product: {
          id: i.product_id,
          name: i.name,
          price_net: parseFloat(i.price_net),
          vat_rate: i.vat_rate ?? 8,
          unit: i.unit,
          image: i.image,
        },
        quantity: i.quantity,
      }));

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (isLoggedIn) {
        try {
          const res = await fetch(`${API_URL}/api/cart`, {
            credentials: "include",
          });
          const data = await res.json();
          setItems(mapFromBackend(data));
        } catch {
          setItems([]);
        }
      } else {
        const local = localStorage.getItem("cart");
        const parsed = local ? JSON.parse(local) : [];
        setItems(parsed.filter((i) => i?.product?.id));
      }
      setLoading(false);
    };

    loadCart();
  }, [isLoggedIn, API_URL]);

  useEffect(() => {
    const mergeCart = async () => {
      if (user === null) return;
      if (!isLoggedIn) return;

      const localCart = localStorage.getItem("cart");
      if (!localCart) return;

      // Check current server-side cart
      const currentRes = await fetch(`${API_URL}/api/cart`, {
        credentials: "include",
      });
      const currentData = await currentRes.json();
      const currentItems = mapFromBackend(currentData);

      if (currentItems.length > 0) {
        localStorage.removeItem("cart");
        return;
      }

      const itemsToMerge = JSON.parse(localCart).filter(
        (item) => item?.product?.id && item.quantity > 0
      );

      for (const item of itemsToMerge) {
        await fetch(`${API_URL}/api/cart`, {
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

      const res = await fetch(`${API_URL}/api/cart`, {
        credentials: "include",
      });
      const merged = await res.json();
      setItems(mapFromBackend(merged));
    };

    mergeCart();
  }, [user, isLoggedIn, API_URL]);

  useEffect(() => {
    if (!isLoggedIn && !loading) {
      const validItems = items.filter((i) => i?.product?.id);
      localStorage.setItem("cart", JSON.stringify(validItems));
    }
  }, [items, isLoggedIn, loading]);

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
      await fetch(`${API_URL}/api/cart`, {
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
      await fetch(`${API_URL}/api/cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
    }
  };

  const clearCart = async () => {
    setItems([]);
    if (isLoggedIn) {
      await fetch(`${API_URL}/api/cart`, {
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
