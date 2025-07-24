// src/pages/account/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import { AuthFetch }       from "../../components/auth/AuthFetch";
import Spinner             from "../../components/common/Spinner";
import LoadError           from "../../components/common/LoadError";
import OrderTile           from "../../components/account/OrderTile";
import OrderDetails from "../../components/account/OrderDetails";
import Button              from "../../components/common/Button";
import { useLocation }     from "react-router-dom";

const API_URL   = process.env.REACT_APP_API_URL;
const PAGE_SIZE = 4;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  // czytamy ?open=123
  const { search } = useLocation();
  const qs = new URLSearchParams(search);
  const initialOpen = qs.has("open") ? Number(qs.get("open")) : null;
  const [openId, setOpenId] = useState(initialOpen);

  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  // przewijamy dopiero, gdy w DOM pojawił się kafel / szczegóły
  useEffect(() => {
    if (openId !== null) {
      // najpierw spróbuj div‑a ze szczegółami ↓
      const el =
        document.getElementById(`order-tile-${openId}`);

      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [openId, orders]);           // <‑‑ zależymy też od załadowanych danych

  // każda zmiana page = wracamy na górę
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    AuthFetch(`${API_URL}/api/orders/latest?limit=1000`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner fullscreen={false}/>;
  if (error)   return <LoadError onRetry={() => window.location.reload()} />;

  const start      = (page - 1) * PAGE_SIZE;
  const slice      = orders.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(orders.length / PAGE_SIZE);

  return (
    <div className="account-orders">
      <h2>Moje zamówienia</h2>

      {orders.length === 0
        ? <p>Nie masz jeszcze żadnych zamówień.</p>
        : slice.map(o => (
            <React.Fragment key={o.id}>
              <div id={`order-tile-${o.id}`}>
                <OrderTile
                  {...o}
                  isOpen={openId === o.id}
                  onToggle={() =>
                    setOpenId(prev => (prev === o.id ? null : o.id))
                  }
                />
              </div>

              {openId === o.id && (
                <div
                  id={`order-details-${o.id}`}
                  className="order-details-row"
                >
                  <OrderDetails id={o.id} />
                </div>
              )}
            </React.Fragment>
          ))
      }

      {totalPages > 1 && (
        <div className="pagination-orders">
          <Button
            variant="beige"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            « Poprzednia
          </Button>

          <span className="pagination-info">
            Strona {page} / {totalPages}
          </span>

          <Button
            variant="beige"
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Następna »
          </Button>
        </div>
      )}
    </div>
  );
}
