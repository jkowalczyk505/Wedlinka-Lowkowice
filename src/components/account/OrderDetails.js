// src/components/account/OrderDetails.jsx
import { useEffect, useState } from "react";
import Spinner from "../common/Spinner";
import LoadError from "../common/LoadError";
import { AuthFetch } from "../auth/AuthFetch";
import { statusToPL }           from "../../utils/orderStatus";

const API_URL = process.env.REACT_APP_API_URL;

export default function OrderDetails({ id }) {
  const [data, setData]   = useState(null);
  const [loading, setLd]  = useState(true);
  const [error, setErr]   = useState(false);

  useEffect(() => {
    setLd(true); setErr(false);
    AuthFetch(`${API_URL}/api/orders/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(()=> setErr(true))
      .finally(()=> setLd(false));
  }, [id]);

  if (loading) return <Spinner fullscreen={false} />;
  if (error)   return <LoadError onRetry={()=>window.location.reload()} />;

  const { order, items, shipping, payment, invoice } = data;

  return (
    <div className="order-details">
      <div className="details-col">
        <h4>Produkty</h4>
        <ul>
            {items.map(it => {
                const unit  = Number(it.price);              // cena 1 szt.
                const line  = unit * it.quantity;            // wartość pozycji
                return (
                    <li key={it.id}>
                    {it.quantity} × {it.name}
                    <br/>
                    {unit.toFixed(2)} zł / szt. → 
                    {line.toFixed(2)} zł
                    </li>
                );
            })}
        </ul>
        <p className="totals">
        Suma brutto: {Number(order.total_brut).toFixed(2)} zł<br/>
        Suma netto: {Number(order.total_net).toFixed(2)} zł
        </p>
      </div>

      <div className="details-col">
        <h4>Dostawa</h4>
        <p>{shipping.method} — {Number(shipping.cost).toFixed(2)} zł</p>
        <p>
            {shipping.recipient_first_name} {shipping.recipient_last_name}<br/>
            {shipping.street}<br/>
            {shipping.postal_code} {shipping.city}<br/>
            {shipping.recipient_phone && <>tel: {shipping.recipient_phone}<br/></>}
            {shipping.recipient_email && <>e-mail: {shipping.recipient_email}<br/></>}
            {shipping.locker_code && <>Paczkomat {shipping.locker_code}<br/></>}
            {shipping.notes && <em>Uwagi: {shipping.notes}</em>}
        </p>
      </div>

      <div className="details-col">
        <h4>Płatność</h4>
        <p>{payment.provider}<br/>
            {payment.status}</p>
      </div>

      <div className="details-col">
        <h4>Faktura</h4>
        {invoice?.type ? (
            <>
            <p>{invoice.type === "company" ? "Firma: " : ""}{invoice.name}<br/></p>
            <p>
                {invoice.street}<br/>
                {invoice.zip} {invoice.city}, {invoice.country}
                {invoice.nip && <><br/>NIP: {invoice.nip}</>}<br/>
                {invoice.email}
            </p>
            </>
        ) : (
            <p>Brak</p>
        )}
      </div>
    </div>
  );
}
