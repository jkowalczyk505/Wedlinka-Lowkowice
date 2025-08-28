import { useState, useEffect, useCallback } from "react";
import { useAlert } from "../../components/common/alert/AlertContext";
import { AuthFetch } from "../../components/auth/AuthFetch";
import Spinner from "../../components/common/Spinner";
import LoadError from "../../components/common/LoadError";
import OrdersTable from "../../components/admin/orders/OrdersTable";
import InfoTip from "../../components/common/InfoTip";
import Pagination from "../../components/common/Pagination";
import OrdersControls from "../../components/admin/orders/OrdersControls";
import OrdersSearch from "../../components/admin/orders/OrdersSearch";

const API_URL = process.env.REACT_APP_API_URL;

export default function AdminOrders() {
  const { showAlert } = useAlert();

  const [orders, setOrders] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [failedPage, setFailedPage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeSort, setActiveSort] = useState("default");
  const [activeFilters, setActiveFilters] = useState([
    "waiting_payment",
    "paid",
    "packed",
    "shipped",
    "ready_for_pickup",
  ]);

  const [failedSort, setFailedSort] = useState("desc");
  const [failedFilters, setFailedFilters] = useState(["cancelled", "failed"]);

  const [archivedSort, setArchivedSort] = useState("desc");
  const [archivedFilters, setArchivedFilters] = useState(["delivered"]);

  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = 10;

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

  useEffect(() => {
    setActivePage(1);
    setFailedPage(1);
    setArchivedPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setActivePage(1);
  }, [activeFilters, activeSort]);

  useEffect(() => {
    setFailedPage(1);
  }, [failedSort]);

  useEffect(() => {
    setArchivedPage(1);
  }, [archivedSort]);

  // AdminOrders.jsx (fragment)
  const updateOrderStatus = async (id, status) => {
    try {
      const res = await AuthFetch(`${API_URL}/api/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      // gdy backend zwróci 500 z innych powodów
      if (!res.ok) {
        showAlert("Błąd aktualizacji statusu", "error");
        return;
      }

      const data = await res.json().catch(() => ({}));

      // zaktualizuj tabelę
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, order_status: status } : o))
      );

      // komunikaty zależnie od maila
      if (data?.mail?.sent === false) {
        const reason = data.mail.error ? ` (${data.mail.error})` : "";
        showAlert(
          `Status zmieniony, ale nie wysłano e-maila${reason}`,
          "warning"
        );
      } else {
        showAlert("Status zamówienia zaktualizowany", "success");
      }
    } catch {
      showAlert("Błąd aktualizacji statusu", "error");
    }
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

  const filterAndSort = (array, filters, sortOrder) => {
    let filtered = filters
      ? array.filter((o) => filters.includes(o.order_status))
      : array;

    return filtered.sort((a, b) => {
      if (sortOrder === "asc") {
        return new Date(a.created_at) - new Date(b.created_at);
      }

      if (sortOrder === "desc") {
        return new Date(b.created_at) - new Date(a.created_at);
      }

      // sortOrder === "default"
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

      if (
        a.order_status === "waiting_payment" &&
        b.order_status !== "waiting_payment"
      )
        return 1;
      if (
        b.order_status === "waiting_payment" &&
        a.order_status !== "waiting_payment"
      )
        return -1;

      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  const filteredOrders = orders.filter((o) =>
    o.order_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeOrders = filterAndSort(
    filteredOrders.filter(
      (o) =>
        [
          "waiting_payment",
          "paid",
          "packed",
          "shipped",
          "ready_for_pickup",
        ].includes(o.order_status) && o.payment_status !== "failed"
    ),
    activeFilters,
    activeSort
  );

  const failedOrders = filterAndSort(
    filteredOrders.filter(
      (o) => o.payment_status === "failed" || o.order_status === "cancelled"
    ),
    null,
    failedSort
  );

  const archivedOrders = filterAndSort(
    filteredOrders.filter(
      (o) => o.order_status === "delivered" && o.payment_status !== "failed"
    ),
    null,
    archivedSort
  );

  const paginated = (array, page) =>
    array.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loading) return <Spinner fullscreen={false} />;
  if (error) return <LoadError onRetry={fetchOrders} />;

  return (
    <div className="admin-orders">
      <h1 className="admin-page-title">Zarządzanie zamówieniami</h1>
      <OrdersSearch value={searchQuery} onChange={setSearchQuery} />
      <h2>W trakcie</h2>
      <InfoTip>
        Zamówienia opłacone lub oczekujące na opłacenie, w drodze lub jeszcze
        nieodebrane.
      </InfoTip>
      <OrdersControls
        type="active"
        sortOrder={activeSort}
        onSortChange={setActiveSort}
        selectedStatuses={activeFilters}
        onStatusChange={setActiveFilters}
      />
      {activeOrders.length > 0 ? (
        <>
          <OrdersTable
            orders={paginated(activeOrders, activePage)}
            onOrderStatusChange={updateOrderStatus}
            onPaymentStatusChange={updatePaymentStatus}
          />
          <Pagination
            currentPage={activePage}
            totalPages={Math.ceil(activeOrders.length / itemsPerPage)}
            onPageChange={setActivePage}
          />
        </>
      ) : (
        <p>Brak zamówień w realizacji.</p>
      )}

      <h2>Nieudane</h2>
      <InfoTip>
        Zamówienia anulowane lub z nieudaną płatnością przez bramkę.
      </InfoTip>
      <OrdersControls
        type="failed"
        sortOrder={failedSort}
        onSortChange={setFailedSort}
        selectedStatuses={failedFilters}
        onStatusChange={setFailedFilters}
      />
      {failedOrders.length > 0 ? (
        <>
          <OrdersTable
            orders={paginated(failedOrders, failedPage)}
            onOrderStatusChange={updateOrderStatus}
            onPaymentStatusChange={updatePaymentStatus}
          />
          <Pagination
            currentPage={failedPage}
            totalPages={Math.ceil(failedOrders.length / itemsPerPage)}
            onPageChange={setFailedPage}
          />
        </>
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
      {showArchived && (
        <>
          <OrdersControls
            type="archived"
            sortOrder={archivedSort}
            onSortChange={setArchivedSort}
            selectedStatuses={archivedFilters}
            onStatusChange={setArchivedFilters}
          />
          {archivedOrders.length > 0 ? (
            <>
              <OrdersTable
                orders={paginated(archivedOrders, archivedPage)}
                onOrderStatusChange={updateOrderStatus}
                onPaymentStatusChange={updatePaymentStatus}
              />
              <Pagination
                currentPage={archivedPage}
                totalPages={Math.ceil(archivedOrders.length / itemsPerPage)}
                onPageChange={setArchivedPage}
              />
            </>
          ) : (
            <p>Brak zamówień w archiwum.</p>
          )}
        </>
      )}
    </div>
  );
}
