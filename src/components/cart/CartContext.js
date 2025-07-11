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

  const isLoggedIn = !!user;

  /* -------------------------------- mapowanie -------------------------------- */
  const mapFromBackend = useCallback((data) => {
    return (data.items || [])
      .filter((i) => i?.product_id) // cena może być NULL – nie odrzucamy
      .map((i) => ({
        product: {
          id: i.product_id,
          name: i.name,
          price_net: parseFloat(i.price_net ?? 0),
          vat_rate: i.vat_rate ?? 8,
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

  /* -------------------------- walidacja koszyka w localStorage -------------------------- */
  const validateLocalCart = useCallback(
    async (cart) => {
      let removed = 0;
      const validated = [];

      await Promise.all(
        cart.map(async (item) => {
          try {
            const res = await fetch(
              `${API_URL}/api/products/${item.product.id}`
            );
            if (!res.ok) throw new Error();
            const product = await res.json();
            if (product.is_deleted || !product.is_available) {
              removed++;
              return;
            }
            validated.push({ product, quantity: item.quantity });
          } catch {
            removed++;
          }
        })
      );

      return { validated, removed };
    },
    [API_URL]
  );

  /* ---------------------------------- główne pobranie ---------------------------------- */
  const fetchCart = useCallback(
    async (path = `${API_URL}/api/cart`) => {
      const res = await fetch(path, { credentials: "include" });
      const removed = Number(res.headers.get("X-Cart-Removed") || 0);
      const data = await res.json();
      return { data, removed };
    },
    [API_URL]
  );

  /* ---------------------------------- odświeżanie ---------------------------------- */
  const reloadCart = useCallback(async () => {
    setLoading(true);

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
      }
    } else {
      const local = JSON.parse(localStorage.getItem("cart") || "[]");
      const { validated, removed } = await validateLocalCart(local);

      if (removed) {
        showAlert(
          `Usunięto ${removed} niedostępny${removed === 1 ? "" : "e"} produkt${
            removed > 1 ? "y" : ""
          } z koszyka.`,
          "info"
        );
      }

      setItems(validated);
      localStorage.setItem("cart", JSON.stringify(validated));
    }

    setLoading(false);
  }, [isLoggedIn, fetchCart, mapFromBackend, validateLocalCart, showAlert]);

  /* ------------------------------- pierwszy load ------------------------------- */
  useEffect(() => {
    const load = async () => {
      setLoading(true);

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
        }
      } else {
        const local = JSON.parse(localStorage.getItem("cart") || "[]");
        const { validated } = await validateLocalCart(local);
        setItems(validated);
      }

      setLoading(false);
    };

    load();
  }, [isLoggedIn, fetchCart, mapFromBackend, validateLocalCart, showAlert]);

  /* --------------------- scalanie koszyka po zalogowaniu --------------------- */
  useEffect(() => {
    const mergeCart = async () => {
      if (!user || !isLoggedIn) return;

      const localCart = localStorage.getItem("cart");
      if (!localCart) return;

      const { validated } = await validateLocalCart(JSON.parse(localCart));

      for (const localItem of validated) {
        try {
          await fetch(`${API_URL}/api/cart`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: localItem.product.id,
              quantity: localItem.quantity,
            }),
          });
        } catch (e) {
          // możesz dodać alert jeśli chcesz
        }
      }

      localStorage.removeItem("cart");
      await reloadCart(); // pobierz po scaleniu
    };

    mergeCart();
  }, [user, isLoggedIn, API_URL, validateLocalCart, reloadCart]);

  /* ------------------------ flush do localStorage u gościa ------------------------ */
  useEffect(() => {
    if (!isLoggedIn && !loading) {
      const serializable = items.filter(
        (i) => i.product.is_available !== false && i.product.is_deleted !== true
      );
      localStorage.setItem("cart", JSON.stringify(serializable));
    }
  }, [items, loading, isLoggedIn]);

  /* --------------------------------- mutacje --------------------------------- */
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
        localStorage.setItem("cart", JSON.stringify(updated)); // ← zapis od razu
      }
      return updated;
    });

    /* ---------- zapis na serwerze (jeżeli zalogowany) ---------- */
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

    /* ---------- komunikat dla użytkownika ---------- */
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

    if (isLoggedIn) {
      await fetch(`${API_URL}/api/cart`, {
        method: "DELETE",
        credentials: "include",
      });
    }
  };

  /* -------------------------------- provider -------------------------------- */
  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, reloadCart, loading }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
