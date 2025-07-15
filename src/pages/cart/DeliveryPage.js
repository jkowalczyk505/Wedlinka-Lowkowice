import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../components/cart/CartContext";
import { useAuth } from "../../components/auth/AuthContext";
import { useAlert } from "../../components/common/alert/AlertContext";
import CheckoutSteps from "../../components/cart/CheckoutSteps";
import Button from "../../components/common/Button";
import CartItemTile from "../../components/cart/CartItemTile";
import Spinner from "../../components/common/Spinner";
import LoadError from "../../components/common/LoadError";
import { formatGrossPrice, calculateCartVat } from "../../utils/product";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export default function DeliveryPage() {
  const { items, loading, error, retry } = useCart();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    address2: "",
    zip: "",
    city: "",
    phone: "",
    email: "",
    country: "Polska",
    notes: "",
    wantsInvoice: false,
    acceptTerms: false,
  });

  const [paymentMethod, setPaymentMethod] = useState("przelewy24");
  const [submitting, setSubmitting] = useState(false);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const vat = calculateCartVat(items);
  const freeShippingThreshold = 230;
  const missing = freeShippingThreshold - total;

  useEffect(() => {
    axios
      .get(`${API_URL}/api/shipping`)
      .then((res) => {
        const methods = res.data.methods || [];
        setShippingMethods(methods);
        if (methods.length > 0) setSelectedShipping(methods[0]);
      })
      .catch(() => {
        showAlert("Nie udało się pobrać metod dostawy", "error");
      });
  }, []);

  if (loading) return <Spinner />;
  if (error) return <LoadError message={error} onRetry={retry} />;
  if (items.length === 0) return navigate("/koszyk");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.acceptTerms) return showAlert("Zaakceptuj regulamin", "error");
    // TODO: wysyłka danych na backend
  };

  return (
    <div className="page">
      <div className="cart-page pattern-section">
        <CheckoutSteps currentStep={2} />

        {!user && (
          <div className="login-prompt">
            <span>Masz już konto?</span>
            <Link to="/logowanie">
              <Button variant="red">Zaloguj się</Button>
            </Link>
          </div>
        )}

        <div className="cart-layout">
          <form className="cart-items" onSubmit={handleSubmit}>
            <h2>Sposób dostawy</h2>
            {shippingMethods.map((method) => (
              <label key={method.id}>
                <input
                  type="radio"
                  name="shipping"
                  value={method.id}
                  checked={selectedShipping?.id === method.id}
                  onChange={() => setSelectedShipping(method)}
                />
                {method.name} – {formatGrossPrice(method.price)} zł
              </label>
            ))}

            <h2>Dane odbiorcy</h2>
            <input
              name="firstName"
              placeholder="Imię"
              required
              onChange={handleChange}
            />
            <input
              name="lastName"
              placeholder="Nazwisko"
              required
              onChange={handleChange}
            />
            <input
              name="address"
              placeholder="Adres"
              required
              onChange={handleChange}
            />
            <input
              name="address2"
              placeholder="Ciąg dalszy adresu (opcjonalnie)"
              onChange={handleChange}
            />
            <input
              name="zip"
              placeholder="Kod pocztowy"
              required
              onChange={handleChange}
            />
            <input
              name="city"
              placeholder="Miasto"
              required
              onChange={handleChange}
            />
            <input
              name="phone"
              placeholder="Numer telefonu"
              required
              onChange={handleChange}
            />
            <input
              name="email"
              placeholder="Adres e-mail"
              required
              type="email"
              onChange={handleChange}
            />

            <label>
              <input
                type="checkbox"
                name="wantsInvoice"
                onChange={handleChange}
              />{" "}
              Chcę otrzymać fakturę
            </label>

            <h2>Uwagi do zamówienia</h2>
            <textarea
              name="notes"
              onChange={handleChange}
              placeholder="Uwagi do zamówienia (opcjonalne)"
            />

            <h2>Metoda płatności</h2>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="przelewy24"
                checked={paymentMethod === "przelewy24"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />{" "}
              Przelewy24
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />{" "}
              Płatność przy odbiorze
            </label>

            <label>
              <input
                type="checkbox"
                name="acceptTerms"
                required
                checked={form.acceptTerms}
                onChange={handleChange}
              />{" "}
              Przeczytałem/am i akceptuję regulamin
            </label>

            <Button type="submit" disabled={submitting}>
              Kupuję i płacę
            </Button>
          </form>

          <div className="cart-summary">
            {missing > 0 ? (
              <div className="free-shipping">
                Do darmowej dostawy brakuje{" "}
                <em>{formatGrossPrice(missing)} zł</em>
              </div>
            ) : (
              <div className="free-shipping free">Masz darmową dostawę!</div>
            )}

            <ul>
              {items.map(({ product, quantity }) => (
                <CartItemTile
                  key={product.id}
                  product={product}
                  quantity={quantity}
                />
              ))}
            </ul>

            <div className="summary-total">
              <div className="summary-brutto">
                <span>Produkty:</span>
                <strong>{formatGrossPrice(total)} zł</strong>
              </div>
              <div className="summary-brutto">
                <span>Dostawa:</span>
                <strong>
                  {selectedShipping
                    ? formatGrossPrice(selectedShipping.price) + " zł"
                    : "-"}
                </strong>
              </div>
              <div className="summary-brutto">
                <span>Razem:</span>
                <strong>
                  {formatGrossPrice(total + (selectedShipping?.price ?? 0))} zł
                </strong>
              </div>
              <div className="summary-vat">
                W tym VAT: <strong>{formatGrossPrice(vat)} zł</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
