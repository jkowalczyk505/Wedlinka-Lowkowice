import { useEffect, useState } from "react";
import Spinner from "../../common/Spinner";
import LoadError from "../../common/LoadError";
import { AuthFetch } from "../../auth/AuthFetch";
import { shippingToPL } from "../../../utils/shippingMethod";
import { paymentStatusToPL } from "../../../utils/paymentStatus";
import { paymentMethodToPL } from "../../../utils/paymentMethod";
import {
  formatGrossPrice as fmt,
  categoryToSlug,
  formatQuantity,
} from "../../../utils/product";
import Button from "../../common/Button";
import { ReactComponent as DefaultIcon } from "../../../assets/szynka-ikona.svg";

const API_URL = process.env.REACT_APP_API_URL;

function Thumbnail({ src, alt, className }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <DefaultIcon className={className + " default-thumb"} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}

export default function OrderDetailsAdmin({ id }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editingTrack, setEditingTrack]       = useState(false);
  const [trackingNumber, setTrackingNumber]   = useState("");

  useEffect(() => {
    setLoading(true);
    setError(false);
    AuthFetch(`${API_URL}/api/orders/admin/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setOrder(data);
        setTrackingNumber(data.shipping.tracking_number || "");
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner fullscreen={false} />;
  if (error) return <LoadError onRetry={() => window.location.reload()} />;

  const { order: summary, items, shipping, payment, invoice } = order;

   // handler zapisu numeru przesyłki
 const saveTracking = async () => {
   try {
     const res = await AuthFetch(
       `${API_URL}/api/orders/${summary.id}/tracking-number`,
       {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ trackingNumber }),
       }
     );
     if (!res.ok) throw new Error();
     // zaktualizuj lokalnie
     setOrder((o) => ({
       ...o,
       shipping: { ...o.shipping, tracking_number: trackingNumber },
     }));
     setEditingTrack(false);
   } catch {
     alert("Nie udało się zapisać numeru przesyłki");
   }
 };


  const total = parseFloat(payment.amount);
  const sumProducts = items.reduce(
    (sum, it) => sum + it.quantity * parseFloat(it.price),
    0
  );

  return (
    <div className="admin-order-details">
      <h4>Szczegóły zamówienia #{summary.order_number}</h4>

      <ul className="products-summary">
        {items.map((it) => {
          const unitPrice = parseFloat(it.price);
          const lineTotal = unitPrice * it.quantity;
          const imgUrl = `${API_URL}/uploads/products/${it.image}`;
          return (
            <li key={it.id} className="product-item">
              <div className="thumb-link">
                <Thumbnail src={imgUrl} alt={it.name} className="prod-thumb" />
              </div>

              <div className="product-info">
                <div className="prod-name">
                  {it.name}{" "}
                  <span className="product-weight">
                    {formatQuantity(it.quantityPerUnit)} {it.unit}
                  </span>
                </div>
                <div className="price-line">
                  {it.quantity} × {fmt(unitPrice)} zł → {fmt(lineTotal)} zł
                </div>
              </div>
            </li>
          );
        })}
        <li className="products-total">
          Produkty:<strong> {fmt(sumProducts)} zł</strong>
        </li>
        <li className="shipping-summary">
          Dostawa:
          <strong>
            {" "}
            {shippingToPL(shipping.method)} – {fmt(shipping.cost)} zł
          </strong>
        </li>
        <li className="totals">
          Łącznie:<strong> {fmt(total)} zł</strong>
        </li>
      </ul>

      <div className="details-grid">
        <section>
          <h5>Płatność</h5>
          <p>
            {paymentMethodToPL(payment.provider)} <br />
            Status: <strong>{paymentStatusToPL(payment.status)}</strong>
          </p>
        </section>

        <section>
          <h5>Adres dostawy</h5>
          <p>
            {shipping.recipient_first_name} {shipping.recipient_last_name}{" "}
            <br />
            {shipping.street} <br />
            {shipping.postal_code}&nbsp;{shipping.city} <br />
            {shipping.recipient_phone &&
              `tel.: ${shipping.recipient_phone}`}{" "}
            <br />
            {shipping.recipient_email &&
              `e‑mail: ${shipping.recipient_email}`}{" "}
            <br />
            {shipping.locker_code && (
              <>
                Paczkomat: <strong>{shipping.locker_code}</strong> <br />
              </>
            )}
            {shipping.notes && <em>Uwagi: {shipping.notes}</em>}
          </p>
        </section>

        {invoice?.type && (
          <section>
            <h5>Faktura</h5>
            <p>
              {invoice.type === "company" ? "Firma: " : ""} {invoice.name}{" "}
              <br />
              {invoice.street} <br />
              {invoice.zip} {invoice.city}, {invoice.country} <br />
              {invoice.email} <br />
              {invoice.nip && `NIP: ${invoice.nip}`}
            </p>
            <Button
              onClick={() => {
                // TODO: logika pobierania faktury
                console.log("Pobierz fakturę (placeholder)");
              }}
            >
              Pobierz fakturę
            </Button>
          </section>
        )}

        <section>
          <h5>Numer przesyłki</h5>
          {!editingTrack ? (
            // jeśli jest numer, pokazujemy go + przycisk edycji
            shipping.tracking_number ? (
              <div className="tracking-display">
                <strong>{shipping.tracking_number}</strong>
                <Button
                  variant="red"
                  onClick={() => setEditingTrack(true)}
                >
                  Edytuj
                </Button>
              </div>
            ) : (
              <Button onClick={() => setEditingTrack(true)}>
                Dodaj numer przesyłki
              </Button>
            )
          ) : (
            <div className="tracking-edit">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Numer przesyłki"
              />
              <Button onClick={saveTracking}>Zapisz</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingTrack(false);
                  setTrackingNumber(shipping.tracking_number || "");
                }}
              >
                Anuluj
              </Button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
