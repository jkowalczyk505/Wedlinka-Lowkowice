// src/pages/checkout/CheckoutSummaryPage.jsx
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CartRow from "../../components/cart/CartRow";
import OrderSummaryDetails from "../../components/checkout/OrderSummaryDetails";
import { formatGrossPrice } from "../../utils/product";
import Spinner from "../../components/common/Spinner";
import CheckoutSteps from "../../components/checkout/CheckoutSteps";
import Button from "../../components/common/Button";
import DownloadPaymentPDFButton from "../../components/checkout/DownloadPaymentPDFButton";

const API_URL = process.env.REACT_APP_API_URL;
const FAIL_PATH = "/platnosc-niepowodzenie";

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
      fetch(
        `${API_URL}/api/orders/summary/${orderNumberFromUrl}?token=${searchParams.get(
          "token"
        )}`
      )
        .then((res) => {
          if (!res.ok) throw new Error("Nie udało się pobrać zamówienia");
          return res.json();
        })
        .then((data) => setOrderData(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [initialData, orderNumberFromUrl]);

  useEffect(() => {
    if (!orderData) return;
    const pay = (orderData?.payment?.status || "").toLowerCase();
    const ord = (orderData?.orderStatus || "").toLowerCase();
    const isFailed = pay === "failed" || ord === "cancelled";
    if (isFailed) {
      const on = orderData?.orderNumber || orderNumberFromUrl || "";
      const q = on ? `?order=${encodeURIComponent(on)}` : "";
      navigate(`${FAIL_PATH}${q}`, { replace: true });
    }
  }, [orderData, orderNumberFromUrl, navigate]);

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
            <h1 className="summary-title">
              {(payment?.status || "").toLowerCase() === "ok" ||
              (orderData?.orderStatus || "").toLowerCase() === "paid"
                ? "Dziękujemy za zamówienie!"
                : "Podsumowanie zamówienia"}
            </h1>
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

            <OrderSummaryDetails
              form={form}
              shipping={shipping}
              payment={payment}
              invoice={invoice}
            />

            <Button
              variant="red"
              className="custom-button"
              onClick={() => navigate("/")}
            >
              Powrót na stronę główną
            </Button>
            <DownloadPaymentPDFButton
              orderNumber={orderNumber}
              payment={payment}
            />
          </>
        )}
      </div>
    </div>
  );
}
