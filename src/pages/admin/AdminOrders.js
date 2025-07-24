import { useState, useEffect, useCallback } from "react";
import { useAlert } from "../../components/common/alert/AlertContext";
import { AuthFetch } from "../../components/auth/AuthFetch";
import Spinner from "../../components/common/Spinner";
import LoadError from "../../components/common/LoadError";
import OrdersTable from "../../components/admin/orders/OrdersTable";
import InfoTip from "../../components/common/InfoTip";

const API_URL = process.env.REACT_APP_API_URL;

export default function AdminOrders() {
  const { showAlert } = useAlert();

  const [orders, setOrders] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
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

  const inProgressStatuses = [
    "waiting_payment",
    "paid",
    "packed",
    "shipped",
    "ready_for_pickup",
  ];

  const activeOrders = orders.filter(
    (o) =>
      inProgressStatuses.includes(o.order_status) &&
      o.payment_status !== "failed"
  );

  const failedOrders = orders.filter(
    (o) => o.payment_status === "failed" || o.order_status === "cancelled"
  );

  const archivedOrders = orders.filter(
    (o) => o.order_status === "delivered" && o.payment_status !== "failed"
  );

  function sortOrders(ordersArray) {
    return [...ordersArray].sort((a, b) => {
      // 1. ready_for_pickup na górze
      if (
        a.order_status === "ready_for_pickup" &&
        b.order_status !== "ready_for_pickup"
      )
        return -1;
      if (
        b.order_status === "ready_for_pickup" &&
        a.order_status !== "ready_for_pickup"
      )
        return 1;

      // 2. payment_status === "pending" na dole
      if (a.payment_status === "pending" && b.payment_status !== "pending")
        return 1;
      if (b.payment_status === "pending" && a.payment_status !== "pending")
        return -1;

      // 3. reszta wg daty malejąco
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }

  return (
    <div className="admin-orders">
      <h1 className="admin-page-title">Zarządzanie zamówieniami</h1>

      <h2>W trakcie</h2>
      <InfoTip>
        Zamówienia opłacone lub oczekujące na opłacenie, w drodze lub jeszcze
        nieodebrane.
      </InfoTip>
      {activeOrders.length > 0 ? (
        <OrdersTable
          orders={sortOrders(activeOrders)}
          onOrderStatusChange={updateOrderStatus}
          onPaymentStatusChange={updatePaymentStatus}
        />
      ) : (
        <p>Brak zamówień w realizacji.</p>
      )}

      <h2>Nieudane</h2>
      <InfoTip>
        Zamówienia anulowane lub z nieudaną płatnością przez bramkę.
      </InfoTip>
      {failedOrders.length > 0 ? (
        <OrdersTable
          orders={failedOrders}
          onOrderStatusChange={updateOrderStatus}
          onPaymentStatusChange={updatePaymentStatus}
        />
      ) : (
        <p>Brak nieudanych zamówień.</p>
      )}

      <h2>
        Archiwum{" "}
        <button
          onClick={() => setShowArchived((prev) => !prev)}
          className="admin-show-archive-button"
        >
          {showArchived ? "Ukryj" : "Pokaż"}
        </button>
      </h2>
      <InfoTip>
        Zamówienia zrealizowane i dostarczone lub odebrane przez klienta.
      </InfoTip>

      {showArchived &&
        (archivedOrders.length > 0 ? (
          <OrdersTable
            orders={archivedOrders}
            onOrderStatusChange={updateOrderStatus}
            onPaymentStatusChange={updatePaymentStatus}
          />
        ) : (
          <p>Brak zamówień w archiwum.</p>
        ))}
    </div>
  );
}
