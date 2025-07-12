import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "../auth/AuthContext";
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

  const mapFromBackend = useCallback((data) => {
    return (data.items || [])
      .filter((i) => i?.product_id)
      .map((i) => ({
        product: {
          id: i.product_id,
          name: i.name,
          price: parseFloat(i.price_brut ?? 0),
          unit: i.unit,
          image: i.image,
          slug: i.slug,
          category: i.category,
          is_available: i.is_available,
          is_deleted: i.is_deleted,
        },
        quantity: i.quantity,
      }));
  }, []);

  const validateLocalCart = useCallback(
    async (cart) => {
      let removed = 0;
      let failed = 0;
      const validated = [];

      await Promise.all(
        cart.map(async (item) => {
          try {
            const res = await fetch(
              `${API_URL}/api/products/${item.product.id}`
            );
            if (!res.ok) throw new Error("Invalid response");
            const product = await res.json();
            if (product.is_deleted || !product.is_available) {
              removed++;
              return;
            }
            validated.push({
              product: {
                id: product.id,
                name: product.name,
                price: parseFloat(product.price_brut ?? 0),
                unit: product.unit,
                image: product.image,
                slug: product.slug,
                category: product.category,
                is_available: product.is_available,
                is_deleted: product.is_deleted,
                quantity: parseFloat(product.quantity ?? 1), // ⬅️ TO DODAJ
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

  const fetchCart = useCallback(
    async (path = `${API_URL}/api/cart`) => {
      const res = await fetch(path, { credentials: "include" });
      const removed = Number(res.headers.get("X-Cart-Removed") || 0);
      const data = await res.json();
      return { data, removed };
    },
    [API_URL]
  );

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
        setError(null);
      } catch {
        setItems([]);
        setError("Nie udało się pobrać koszyka.");
      }
    } else {
      try {
        const local = JSON.parse(localStorage.getItem("cart") || "[]");
        const { validated, removed, failed } = await validateLocalCart(local);

        if (failed > 0) {
          setError("Nie udało się połączyć z serwerem.");
          setItems([]);
          return;
        }

        if (removed > 0) {
          showAlert(
            `Usunięto ${removed} niedostępny${
              removed === 1 ? "" : "e"
            } produkt${removed > 1 ? "y" : ""} z koszyka.`,
            "info"
          );
        }

        setItems(validated);
        if (validated.length > 0) {
          localStorage.setItem("cart", JSON.stringify(validated));
        }
        setError(null);
      } catch {
        setItems([]);
        setError("Nie udało się pobrać koszyka.");
      }
    }

    setLoading(false);
  }, [isLoggedIn, fetchCart, mapFromBackend, validateLocalCart, showAlert]);

  useEffect(() => {
    const load = async () => {
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
          setError(null);
        } catch {
          setItems([]);
          setError("Nie udało się pobrać koszyka.");
        }
      } else {
        try {
          const local = JSON.parse(localStorage.getItem("cart") || "[]");
          const { validated, failed } = await validateLocalCart(local);

          if (failed > 0) {
            setError("Nie udało się połączyć z serwerem.");
            setItems([]);
            return;
          }

          setItems(validated);
          if (validated.length > 0) {
            localStorage.setItem("cart", JSON.stringify(validated));
          }
          setError(null);
        } catch {
          setItems([]);
          setError("Nie udało się pobrać koszyka.");
        }
      }

      setLoading(false);
    };

    load();
  }, [isLoggedIn, fetchCart, mapFromBackend, validateLocalCart, showAlert]);

  useEffect(() => {
    const mergeCart = async () => {
      if (!user || !isLoggedIn) return;

      const localCart = localStorage.getItem("cart");
      if (!localCart) return;

      try {
        const { validated } = await validateLocalCart(JSON.parse(localCart));
        for (const localItem of validated) {
          await fetch(`${API_URL}/api/cart`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: localItem.product.id,
              quantity: localItem.quantity,
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
  }, [user, isLoggedIn, API_URL, validateLocalCart, reloadCart]);

  useEffect(() => {
    if (!isLoggedIn && !loading) {
      const serializable = items.filter(
        (i) => i.product.is_available !== false && i.product.is_deleted !== true
      );
      localStorage.setItem("cart", JSON.stringify(serializable));
    }
  }, [items, loading, isLoggedIn]);

  const addItem = async (product, quantity = 1) => {
    if (product.is_deleted || product.is_available === false) {
      return showAlert("Tego produktu nie można dodać do koszyka.", "error");
    }

    setItems((prev) => {
      let updated;
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx > -1) {
        updated = [...prev];
        updated[idx].quantity += quantity;
      } else {
        updated = [...prev, { product, quantity }];
      }
      if (!isLoggedIn) {
        localStorage.setItem("cart", JSON.stringify(updated));
      }
      return updated;
    });

    if (isLoggedIn) {
      try {
        await fetch(`${API_URL}/api/cart`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, quantity }),
        });
      } catch {
        showAlert("Nie udało się zsynchronizować koszyka z serwerem.", "error");
      }
    }

    const totalAmount = quantity * (parseFloat(product.quantity) || 1);
    const unitLabel = product.unit || "szt.";

    showAlert(
      `Dodano “${product.name}” (${formatQuantity(
        totalAmount
      )} ${unitLabel}) do koszyka.`,
      "success"
    );
  };

  const removeItem = async (productId) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.product.id !== productId);
      if (!isLoggedIn) {
        localStorage.setItem("cart", JSON.stringify(updated));
      }
      return updated;
    });

    if (isLoggedIn) {
      await fetch(`${API_URL}/api/cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
    }
  };

  const clearCart = async () => {
    setItems(() => {
      if (!isLoggedIn) localStorage.removeItem("cart");
      return [];
    });
    setError(null);

    if (isLoggedIn) {
      await fetch(`${API_URL}/api/cart`, {
        method: "DELETE",
        credentials: "include",
      });
    }
  };

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
