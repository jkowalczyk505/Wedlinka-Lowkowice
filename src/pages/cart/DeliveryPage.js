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
import PostalCodeInput from "../../components/common/PostalCodeInput";
import {
  isPostalCodeValid,
  parsePostalCodeToDigits,
  joinPostalCodeDigits,
} from "../../utils/postalCode";

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
    companyName: "",
    nip: "",
    acceptTerms: false,
  });

  const [postalDigits, setPostalDigits] = useState(["", "", "", "", ""]);

  const [paymentMethod, setPaymentMethod] = useState("przelewy24");
  const [submitting, setSubmitting] = useState(false);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const vat = calculateCartVat(items);
  const freeShippingThreshold = 230;
  const missing = freeShippingThreshold - total;

  const handlePostalDigitChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length > 1) return;

    const newDigits = [...postalDigits];
    newDigits[index] = val;
    setPostalDigits(newDigits);

    if (val && index < 4) {
      const next = document.getElementById(`postal-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handlePostalDigitKeyDown = (e, index) => {
    const key = e.key;

    if (key === "Backspace") {
      if (postalDigits[index]) {
        const newDigits = [...postalDigits];
        newDigits[index] = "";
        setPostalDigits(newDigits);
      } else if (index > 0) {
        const prev = document.getElementById(`postal-${index - 1}`);
        if (prev) prev.focus();
      }
    }

    if (key === "ArrowRight" && index < 4) {
      const next = document.getElementById(`postal-${index + 1}`);
      if (next) next.focus();
    }

    if (key === "ArrowLeft" && index > 0) {
      const prev = document.getElementById(`postal-${index - 1}`);
      if (prev) prev.focus();
    }
  };

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
    if (!form.acceptTerms)
      return showAlert("Zaakceptuj regulamin i politykę prywatności", "error");
    const fullPostalCode = joinPostalCodeDigits(postalDigits);

    if (!isPostalCodeValid(fullPostalCode)) {
      showAlert("Kod pocztowy musi być w formacie 12-345.", "error");
      return;
    }

    const invoiceType = form.wantsInvoice
      ? form.companyName || form.nip
        ? "company"
        : "individual"
      : "none";

    if (paymentMethod === "bank_transfer") {
      // pokaż dane do przelewu lub przekieruj na stronę z instrukcjami
      // możesz też złożyć zamówienie jako "pending"
      navigate("/podsumowanie");
    }

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
          <form className="form-wrapper cart-items" onSubmit={handleSubmit}>
            <div className="form-group">
              <h2 className="form-group-heading">Sposób dostawy</h2>
              <div className="form-section">
                {shippingMethods
                  .flatMap((method) => {
                    if (method.cod) {
                      return [
                        {
                          ...method,
                          id: method.id + "_prepaid",
                          label: method.label,
                          codSelected: false,
                          priceTotal: method.price,
                        },
                        {
                          ...method,
                          id: method.id + "_cod",
                          label: method.label + " (za pobraniem)",
                          codSelected: true,
                          priceTotal: method.price + (method.codFee || 0),
                        },
                      ];
                    } else {
                      return [
                        {
                          ...method,
                          id: method.id,
                          label: method.label,
                          codSelected: false,
                          priceTotal: method.price,
                        },
                      ];
                    }
                  })
                  .map((option) => (
                    <label className="radio" key={option.id}>
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={selectedShipping?.id === option.id}
                        onChange={() => {
                          setSelectedShipping(option);
                          if (
                            paymentMethod === "cod" &&
                            !option.id.includes("pickup")
                          ) {
                            setPaymentMethod("przelewy24");
                          }
                        }}
                      />
                      {option.label} – {formatGrossPrice(option.priceTotal)} zł
                    </label>
                  ))}
              </div>
            </div>

            <div className="form-group">
              <h2 className="form-group-heading">Dane odbiorcy</h2>
              <div className="form-section address">
                <div className="form-row">
                  <label htmlFor="firstName">
                    Imię <span className="required">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="lastName">
                    Nazwisko <span className="required">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="address">
                    Ulica i numer domu <span className="required">*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    placeholder="Nazwa ulicy, numeru budynku, np. Akacjowa 42"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="address2">Numer mieszkania</label>
                  <input
                    id="address2"
                    name="address2"
                    placeholder="Numer mieszkania (opcjonalnie)"
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <label>
                    Kod pocztowy <span className="required">*</span>
                  </label>
                  <PostalCodeInput
                    digits={postalDigits}
                    onDigitChange={handlePostalDigitChange}
                    onDigitKeyDown={handlePostalDigitKeyDown}
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="city">
                    Miasto <span className="required">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="phone">
                    Numer telefonu <span className="required">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="email">
                    Adres e-mail <span className="required">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row full-width">
                  <label className="invoice_check">
                    <input
                      type="checkbox"
                      name="wantsInvoice"
                      checked={form.wantsInvoice}
                      onChange={handleChange}
                    />{" "}
                    Chcę otrzymać fakturę
                  </label>
                </div>

                {form.wantsInvoice && (
                  <div className="invoice-extra">
                    <div className="form-row">
                      <label htmlFor="companyName">
                        Nazwa firmy (opcjonalnie)
                      </label>
                      <input
                        id="companyName"
                        name="companyName"
                        value={form.companyName}
                        onChange={handleChange}
                        placeholder="Nazwa firmy"
                      />
                    </div>

                    <div className="form-row">
                      <label htmlFor="nip">NIP (opcjonalnie)</label>
                      <input
                        id="nip"
                        name="nip"
                        value={form.nip}
                        onChange={handleChange}
                        placeholder="Numer NIP"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <h2 className="form-group-heading">Informacje dodatkowe</h2>
              <div className="form-section">
                <h3>Uwagi do zamówienia (opcjonalne)</h3>
                <textarea
                  name="notes"
                  onChange={handleChange}
                  placeholder="Przekaż swoją wiadomość"
                />
              </div>
            </div>

            <div className="form-group">
              <h2 className="form-group-heading">Metoda płatności</h2>
              <div className="form-section">
                <label className="radio">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="przelewy24"
                    checked={paymentMethod === "przelewy24"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />{" "}
                  Przelewy24
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />{" "}
                  Przelew tradycyjny
                </label>
                <label
                  className={`radio ${
                    !selectedShipping?.id.includes("pickup") ? "disabled" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={!selectedShipping?.id.includes("pickup")}
                  />{" "}
                  Płatność przy odbiorze
                </label>
              </div>
            </div>
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
              <div className="brutto">
                <span>Produkty:</span>
                <strong>{formatGrossPrice(total)} zł</strong>
              </div>
              <div className="brutto">
                <span>Dostawa:</span>
                <strong>
                  {selectedShipping
                    ? formatGrossPrice(selectedShipping.priceTotal) + " zł"
                    : "-"}
                </strong>
              </div>
              <div className="summary-brutto">
                <span>Razem:</span>
                <strong>
                  {formatGrossPrice(
                    total + (selectedShipping?.priceTotal ?? 0)
                  )}{" "}
                  zł
                </strong>
              </div>
              <div className="summary-vat">
                W tym VAT: <strong>{formatGrossPrice(vat)} zł</strong>
              </div>
            </div>

            <div className="terms-and-submit">
              <label className="accept-terms-label">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  required
                  checked={form.acceptTerms}
                  onChange={handleChange}
                />{" "}
                Oświadczam, że zapoznałem się i akceptuję Regulamin i Politykę
                prywatności
                <span className="required">*</span>
              </label>

              <Button type="submit" disabled={submitting}>
                Kupuję i płacę
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
