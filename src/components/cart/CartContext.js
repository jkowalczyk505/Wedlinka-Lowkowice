// src/components/cart/CartContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "../auth/AuthContext";
import { AuthFetch } from "../auth/AuthFetch";
import { useAlert } from "../common/alert/AlertContext";
import { formatQuantity } from "../../utils/product";

const CartContext = createContext();

export function CartProvider({ children }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLoggedIn = !!user;

  // Mapowanie odpowiedzi backendu na nasz kształt
  const mapFromBackend = useCallback((data) => {
    return (data.items || [])
      .filter((i) => i?.product_id)
      .map((i) => ({
        product: {
          id: i.product_id,
          name: i.name,
          price: parseFloat(i.price_brut ?? 0),
          vatRate: parseFloat(i.vat_rate ?? 0),
          quantityPerUnit: parseFloat(i.quantityPerUnit),
          unit: i.unit,
          image: i.image,
          slug: i.slug,
          category: i.category,
          is_available: i.is_available,
          is_deleted: i.is_deleted,
        },
        quantity: parseInt(i.cartQuantity, 10),
      }));
  }, []);

  // Sprawdzenie produktów z localStorage z backendem
  const validateLocalCart = useCallback(
    async (cart) => {
      let removed = 0,
        failed = 0;
      const validated = [];

      await Promise.all(
        cart.map(async (item) => {
          try {
            const res = await fetch(
              `${API_URL}/api/products/${item.product.id}`
            );
            if (!res.ok) throw new Error("Invalid response");
            const p = await res.json();
            if (p.is_deleted || !p.is_available) {
              removed++;
              return;
            }
            validated.push({
              product: {
                id: p.id,
                name: p.name,
                price: parseFloat(p.price_brut ?? 0),
                vatRate: parseFloat(p.vat_rate ?? 0),
                quantityPerUnit: parseFloat(p.quantity ?? 1),
                unit: p.unit,
                image: p.image,
                slug: p.slug,
                category: p.category,
                is_available: p.is_available,
                is_deleted: p.is_deleted,
              },
              quantity: item.quantity,
            });
          } catch {
            failed++;
          }
        })
      );

      return { validated, removed, failed };
    },
    [API_URL]
  );

  // Pobranie koszyka z backendu
  const fetchCart = useCallback(
    async (path = `${API_URL}/api/cart`) => {
      const res = await AuthFetch(path);
      const removed = Number(res.headers.get("X-Cart-Removed") || 0);
      const data = await res.json();
      return { data, removed };
    },
    [API_URL]
  );

  // Ładowanie/odświeżanie koszyka (zalogowani i goście)
  const reloadCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isLoggedIn) {
      try {
        const { data, removed } = await fetchCart();
        if (removed) {
          showAlert(
            `Usunięto ${removed} niedostępny${
              removed === 1 ? "" : "e"
            } produkt${removed > 1 ? "y" : ""} z koszyka.`,
            "info"
          );
        }
        setItems(mapFromBackend(data));
      } catch {
        setItems([]);
        setError("Nie udało się pobrać koszyka.");
      } finally {
        setLoading(false);
      }
    } else {
      const local = JSON.parse(localStorage.getItem("cart") || "[]");
      let finalItems = local;
      try {
        const { validated, removed, failed } = await validateLocalCart(local);
        if (failed === 0) {
          finalItems = validated;
          if (removed) {
            showAlert(
              `Usunięto ${removed} niedostępny${
                removed === 1 ? "" : "e"
              } produkt${removed > 1 ? "y" : ""} z koszyka.`,
              "info"
            );
          }
          if (validated.length) {
            localStorage.setItem("cart", JSON.stringify(validated));
          } else {
            localStorage.removeItem("cart");
          }
        } else {
          setError("Nie udało się połączyć z serwerem.");
        }
      } catch {
        setError("Nie udało się połączyć z serwerem.");
      } finally {
        setItems(finalItems);
        setLoading(false);
      }
    }
  }, [isLoggedIn, fetchCart, mapFromBackend, validateLocalCart, showAlert]);

  // Inicjalne załadowanie koszyka
  useEffect(() => {
    reloadCart();
  }, [reloadCart]);

  // Synchronizacja localStorage przy zmianach (dla gościa)
  useEffect(() => {
    if (!isLoggedIn) {
      if (items.length) {
        localStorage.setItem("cart", JSON.stringify(items));
      } else {
        localStorage.removeItem("cart");
      }
    }
  }, [items, isLoggedIn]);

  // Merge koszyka gościa do konta zalogowanego
  useEffect(() => {
    if (!user || !isLoggedIn) return;
    const mergeCart = async () => {
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (!localCart.length) return;
      try {
        const { validated } = await validateLocalCart(localCart);
        for (const item of validated) {
          await AuthFetch(`${API_URL}/api/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: item.product.id,
              quantity: item.quantity,
            }),
          });
        }
        localStorage.removeItem("cart");
        await reloadCart();
      } catch {
        showAlert("Nie udało się połączyć koszyka gościa z kontem.", "error");
      }
    };
    mergeCart();
  }, [user, isLoggedIn, API_URL, validateLocalCart, reloadCart, showAlert]);

  // Dodawanie pozycji
  const addItem = async (product, quantity = 1) => {
    if (product.is_deleted || !product.is_available) {
      return showAlert("Tego produktu nie można dodać do koszyka.", "error");
    }
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      const updated =
        idx > -1
          ? prev.map((i, j) =>
              j === idx ? { ...i, quantity: i.quantity + quantity } : i
            )
          : [...prev, { product, quantity }];
      if (!isLoggedIn) localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
    if (isLoggedIn) {
      try {
        await AuthFetch(`${API_URL}/api/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, quantity }),
        });
      } catch {
        showAlert("Nie udało się zsynchronizować koszyka z serwerem.", "error");
      }
    }
    const totalAmount = quantity * (parseFloat(product.quantity) || 1);
    showAlert(
      `Dodano “${product.name}” (${formatQuantity(totalAmount)} ${
        product.unit
      }) do koszyka.`,
      "success"
    );
  };

  // Usuwanie pojedynczej pozycji
  const removeItem = async (productId) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.product.id !== productId);
      if (!isLoggedIn) localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
    if (isLoggedIn) {
      await AuthFetch(`${API_URL}/api/cart/${productId}`, {
        method: "DELETE",
      });
    }
  };

  // Czyszczenie całego koszyka
  const clearCart = async () => {
    setItems([]);
    if (!isLoggedIn) {
      localStorage.removeItem("cart");
    } else {
      await AuthFetch(`${API_URL}/api/cart`, {
        method: "DELETE",
      });
    }
    setError(null);
  };

  // Aktualizacja ilości
  const updateQuantity = async (product, quantity) => {
    setItems((prev) =>
      prev.map((i) => (i.product.id === product.id ? { ...i, quantity } : i))
    );
    if (isLoggedIn) {
      try {
        await AuthFetch(`${API_URL}/api/cart`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, quantity }),
        });
        await reloadCart();
      } catch {
        showAlert(
          "Nie udało się zaktualizować ilości produktów na serwerze.",
          "error"
        );
      }
    } else {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  };

  // Retry po błędzie
  const retry = () => {
    setError(null);
    reloadCart();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        reloadCart,
        updateQuantity,
        retry,
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
