import { useState, useEffect, useCallback } from "react";
import { useAlert } from "../../components/common/alert/AlertContext";
import { AuthFetch } from "../../components/auth/AuthFetch";
import Spinner from "../../components/common/Spinner";
import LoadError from "../../components/common/LoadError";
import OrdersTable from "../../components/admin/orders/OrdersTable";

const API_URL = process.env.REACT_APP_API_URL;

export default function AdminOrders() {
  const { showAlert } = useAlert();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /* ---------- Fetch zamówień ---------- */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await AuthFetch(`${API_URL}/api/orders`);
      if (!res.ok) throw new Error("Brak dostępu");
      setOrders(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ---------- Aktualizacja statusów ---------- */
  const updateOrderStatus = async (id, status) => {
    const res = await AuthFetch(`${API_URL}/api/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return showAlert("Błąd aktualizacji statusu", "error");
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, order_status: status } : o))
    );
    showAlert("Status zamówienia zaktualizowany", "success");
  };

  const updatePaymentStatus = async (id, status) => {
    const res = await AuthFetch(`${API_URL}/api/orders/${id}/payment-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok)
      return showAlert("Błąd aktualizacji statusu płatności", "error");
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, payment_status: status } : o))
    );
    showAlert("Status płatności zaktualizowany", "info");
  };

  /* ---------- UI ---------- */
  if (loading) return <Spinner fullscreen={false} />;
  if (error) return <LoadError onRetry={fetchOrders} />;

  return (
    <div className="admin-orders">
      <h1 className="admin-page-title">Zarządzanie zamówieniami</h1>

      <OrdersTable
        orders={orders}
        onOrderStatusChange={updateOrderStatus}
        onPaymentStatusChange={updatePaymentStatus}
      />
    </div>
  );
}
