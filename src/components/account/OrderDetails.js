// src/components/account/OrderDetails.jsx
import { useEffect, useState } from "react";
import Spinner from "../common/Spinner";
import LoadError from "../common/LoadError";
import { AuthFetch } from "../auth/AuthFetch";
import { shippingToPL } from "../../utils/shippingMethod";
import { paymentStatusToPL } from "../../utils/paymentStatus";
import { paymentMethodToPL } from "../../utils/paymentMethod";
import { formatGrossPrice as fmt, categoryToSlug, formatQuantity } from "../../utils/product";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import { Link } from "react-router-dom";
import DownloadPaymentPDFButton from "../checkout/DownloadPaymentPDFButton";
import { ReactComponent as DefaultIcon } from "../../assets/szynka-ikona.svg";

import Button from "../common/Button";
import ReviewModal from "../reviews/ReviewModal";

const API_URL = process.env.REACT_APP_API_URL;
// wewnętrzny thumbnail z fallbackem
function Thumbnail({ src, alt, className }) {
  const [error, setError] = useState(false);
  if (error || !src) {
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

export default function OrderDetails({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLd] = useState(true);
  const [error, setErr] = useState(false);
  const [showMore, setShowMore] = useState(false);

 // modal do dodawania opinii
 const [modalProductId, setModalProductId] = useState(null);

  // 1) fetch zamówienia + items z flagą canReview
  const fetchDetails = () => {
    setLd(true);
    setErr(false);
    AuthFetch(`${API_URL}/api/orders/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setErr(true))
      .finally(() => setLd(false));
  };


  useEffect(() => {
    fetchDetails();
  }, [id]);


  if (loading) return <Spinner fullscreen={false} />;
  if (error) return <LoadError onRetry={() => window.location.reload()} />;

  const { order, items, shipping, payment, invoice } = data;

  // 1. suma pozycji (netto+VAT już w price)
  const sumProducts = items.reduce(
    (sum, it) => sum + it.quantity * parseFloat(it.price),
    0
  );
  // 2. pełna kwota z payment.amount
  const totalAll = parseFloat(payment.amount);

  // ikona rozwijania
  const Icon = showMore ? FiChevronDown : FiChevronRight;

  return (
    <div className="order-details">
      <ul className="products-summary">
        {items.map((it) => {
          const unitPrice = parseFloat(it.price);
          const lineTotal = unitPrice * it.quantity;
          const canReview = it.canReview;
          const imgUrl = `${API_URL}/uploads/products/${it.image}`;
          return (
            <li key={it.id} className="product-item">
              <Link
                to={`/sklep/${categoryToSlug(it.category)}/${it.slug}`}
                className="thumb-link"
              >
                <Thumbnail
                  src={imgUrl}
                  alt={it.name}
                  className="prod-thumb"
                />
              </Link>

              <div className="product-info">
                <Link
                  to={`/sklep/${categoryToSlug(it.category)}/${it.slug}`}
                  className="prod-link"
                >
                  {it.name}{" "}
                  <span className="product-weight">
                    {formatQuantity(it.quantityPerUnit)} {it.unit}
                  </span>
                </Link>
                <div className="price-line">
                  {it.quantity} × {fmt(unitPrice)} zł → 
                  {fmt(lineTotal)} zł
                </div>

                {/* przycisk Oceń */}
               {canReview && (
                 <Button
                   variant="beige"
                   onClick={() => setModalProductId(it.id)}
                 >
                   Oceń
                 </Button>
               )}
              </div>
            </li>
          );
        })}
        <li className="products-total">
          <strong>Produkty:</strong> {fmt(sumProducts)} zł
        </li>
        <li className="shipping-summary">
          <strong>Dostawa:</strong> {shippingToPL(shipping.method)} –{" "}
          {fmt(shipping.cost)} zł
        </li>
        <li className="tracking-number">
          {/* numer przesyłki (jeśli istnieje) */}
          {shipping.tracking_number && (
            <div>
              <strong>Numer przesyłki:</strong> {shipping.tracking_number}
            </div>
          )}
        </li>
        <li className="totals">Łącznie: {fmt(totalAll)} zł</li>
      </ul>

      <button
        className="show-more-btn"
        onClick={() => setShowMore((prev) => !prev)}
      >
        <Icon className="icon" />
        {showMore ? "Ukryj szczegóły" : "Więcej szczegółów"}
      </button>

      {showMore && (
        <div className="details-expanded">
          <section>
            <h5>Dostawa</h5>
            <p>
              {shipping.recipient_first_name} {shipping.recipient_last_name}
              <br />
              {shipping.street}
              <br />
              {shipping.postal_code}&nbsp;{shipping.city}
              <br />
              {shipping.recipient_phone && `tel.: ${shipping.recipient_phone}`}
              <br />
              {shipping.recipient_email &&
                `e‑mail: ${shipping.recipient_email}`}
              <br />
              {shipping.locker_code && `Paczkomat: ${shipping.locker_code}`}
            </p>
            <p>
              Numer przesyłki:{" "}
              {shipping.tracking_number || "Brak"}
            </p>
            {shipping.notes && <p><em>Uwagi: {shipping.notes}</em></p>}
          </section>

          <section>
            <h5>Płatność</h5>
            <p>
              {paymentMethodToPL(payment.provider)}
              <br />
              Status: <strong>{paymentStatusToPL(payment.status)}</strong>
            </p>
            {payment.provider === "bank_transfer" && (
              <div className="download-payment-btn">
                <DownloadPaymentPDFButton
                  orderNumber={order.order_number}
                  payment={{ ...payment, method: payment.provider }}
                />
              </div>
            )}
          </section>

          <section>
            <h5>Faktura</h5>
            {invoice?.type ? (
              <p>
                {invoice.type === "company" ? "Firma: " : ""} {invoice.name}
                <br />
                {invoice.street}
                <br />
                {invoice.zip}&nbsp;{invoice.city}, {invoice.country}
                <br />
                {invoice.email}
                <br />
                {invoice.nip && `NIP: ${invoice.nip}`}
              </p>
            ) : (
              <p>Brak – faktura nie wystawiona</p>
            )}
          </section>
        </div>
      )}

      {/* modal recenzji */}
     {modalProductId && (
         <ReviewModal
           open={true}
           productId={modalProductId}
           onClose={() => setModalProductId(null)}
           onSaved={() => {
            // 1) najpierw zamknij modal
            setModalProductId(null);
            // 2) odśwież szczegóły zamówienia (usuwa przyciski dla ocenionych)
            fetchDetails();
          }}
         />
       )}
    </div>
  );
}
