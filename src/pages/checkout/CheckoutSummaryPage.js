// src/pages/checkout/CheckoutSummaryPage.jsx
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CartRow from "../../components/cart/CartRow";
import { formatGrossPrice } from "../../utils/product";
import Spinner from "../../components/common/Spinner";
import CheckoutSteps from "../../components/checkout/CheckoutSteps";
import Button from "../../components/common/Button";

const API_URL = process.env.REACT_APP_API_URL;

export default function CheckoutSummaryPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();

  const orderNumberFromUrl = searchParams.get("order");
  const initialData = state && Array.isArray(state.items) ? state : null;

  const [orderData, setOrderData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData && !!orderNumberFromUrl);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialData && orderNumberFromUrl) {
      fetch(`${API_URL}/api/orders/summary/${orderNumberFromUrl}`)
        .then((res) => {
          if (!res.ok) throw new Error("Nie udało się pobrać zamówienia");
          return res.json();
        })
        .then((data) => setOrderData(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [initialData, orderNumberFromUrl]);

  // Bezpieczne destrukturyzowanie
  const {
    orderNumber = "",
    items = [],
    shipping = {},
    form = {},
    invoice = {},
    payment = {},
  } = orderData || {};

  // Obliczamy sumę produktów
  const productsTotal = items.reduce(
    (sum, { product, quantity }) => sum + product.price * quantity,
    0
  );

  return (
    <div className="page">
      <div className="summary-page pattern-section">
        <CheckoutSteps currentStep={3} />

        {loading && <Spinner fullscreen />}
        {error && <p>{error}</p>}
        {!loading && !error && !orderData && <p>Brak danych zamówienia.</p>}

        {!loading && !error && orderData && (
          <>
            <h1 className="summary-title">Dziękujemy za zamówienie!</h1>
            <p>
              Zamówienie <strong>{orderNumber}</strong> zostało przyjęte do
              realizacji.
            </p>

            {/* Tabela produktów */}
            <section>
              <h2>Zawartość zamówienia</h2>
              <div className="cart-table">
                <CartRow isHeader />
                {items.length > 0 ? (
                  items.map(({ product, quantity }) => (
                    <CartRow
                      key={product.id}
                      product={product}
                      quantity={quantity}
                      readOnly
                      onQuantityChange={() => {}}
                      onRemove={() => {}}
                    />
                  ))
                ) : (
                  <p>Brak danych o produktach.</p>
                )}
              </div>
              {/* suma produktów */}
              <div className="order-total">
                <p>
                  Razem za produkty:{" "}
                  <strong>{formatGrossPrice(productsTotal)} zł</strong>
                </p>
              </div>
            </section>

            {/* Trzy kolumny z danymi */}
            <div className="summary-details">
              {/* Twoje dane */}
              <div className="detail-column">
                <h3>Twoje dane</h3>
                <p>
                  {form.firstName} {form.lastName}
                </p>
                <p>
                  {form.address}
                  {form.address2 ? ` / ${form.address2}` : ""}
                </p>
                <p>
                  {form.zip} {form.city}
                </p>
                <p>{form.country}</p>
                {form.phone && <p>{form.phone}</p>}
                {form.email && <p>{form.email}</p>}
              </div>

              {/* Dostawa i płatność */}
              <div className="detail-column">
                <h3>Dostawa i płatność</h3>
                <p>
                  Forma dostawy: <strong>{shipping.name}</strong>
                </p>
                {shipping.id === "inpost" && shipping.lockerCode && (
                  <p>
                    Kod paczkomatu: <strong>{shipping.lockerCode}</strong>
                  </p>
                )}
                <p>
                  Forma płatności:{" "}
                  <strong>
                    {payment.method === "cod"
                      ? "Przy odbiorze"
                      : payment.method === "bank_transfer"
                      ? "Przelew tradycyjny"
                      : payment.method === "przelewy24"
                      ? "Przelewy24"
                      : payment.method}
                  </strong>
                </p>
                <p>
                  Koszt dostawy:{" "}
                  <strong>
                    {formatGrossPrice(shipping.priceTotal || 0)} zł
                  </strong>
                </p>
              </div>

              {/* Informacje dodatkowe / faktura */}
              <div className="detail-column">
                <h3>Informacje dodatkowe</h3>

                {/* Uwagi zawsze z etykietą */}
                <p>
                  <h4>Uwagi do zamówienia:</h4>{" "}
                  {form.notes && form.notes.trim() !== ""
                    ? form.notes
                    : "Brak uwag"}
                </p>

                {/* Dane faktury zawsze z etykietą */}
                {invoice.type ? (
                  <>
                    <p>
                      <h4>Faktura VAT:</h4>
                    </p>
                    <p>Nazwa: {invoice.name}</p>
                    <p>Adres: {invoice.street}</p>
                    <p>Kod pocztowy: {invoice.zip}</p>
                    <p>Miasto: {invoice.city}</p>
                    <p>Kraj: {invoice.country}</p>
                    {invoice.type === "company" && invoice.nip && (
                      <p>NIP: {invoice.nip}</p>
                    )}
                    {invoice.email && <p>Email do faktury: {invoice.email}</p>}
                  </>
                ) : (
                  <p>
                    <h4>Faktura VAT:</h4> Bez faktury VAT
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="red"
              className="custom-button"
              onClick={() => navigate("/")}
            >
              Powrót na stronę główną
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
