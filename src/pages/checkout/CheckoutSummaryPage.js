import { useLocation, Link } from "react-router-dom";

export default function CheckoutSummaryPage() {
  const { state } = useLocation();
  if (!state) return <p>Brak danych zamówienia.</p>;

  const { orderNumber, payment } = state;

  return (
    <div className="summary-page">
      <h1>Dziękujemy! Zamówienie {orderNumber} zostało przyjęte.</h1>

      {payment.method === "bank_transfer" && (
        <>
          <h2>Dane do przelewu</h2>
          <p>
            Kwota: <strong>{payment.amount} zł</strong>
          </p>
          <p>
            Nr rachunku: <code>{payment.bankAccount}</code>
          </p>
          <p>
            Tytuł przelewu: <code>{payment.title}</code>
          </p>
        </>
      )}

      {payment.method === "cod" && (
        <p>
          Zapłacisz przy odbiorze{" "}
          {payment.deliveryMethod === "pickup" ? "w sklepie." : "u kuriera."}
        </p>
      )}

      {payment.method === "pickup" && <p>Zapłacisz przy odbiorze w sklepie.</p>}

      {payment.method === "przelewy24" && (
        <p>Trwa oczekiwanie na potwierdzenie płatności …</p>
      )}

      <Link to="/">Powrót na stronę główną</Link>
    </div>
  );
}
