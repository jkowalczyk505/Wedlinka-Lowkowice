import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../components/cart/CartContext";
import { useAuth } from "../../components/auth/AuthContext";
import { useAlert } from "../../components/common/alert/AlertContext";
import CheckoutSteps from "../../components/checkout/CheckoutSteps";
import Button from "../../components/common/Button";
import ShippingMethods from "../../components/checkout/ShippingMethods";
import RecipientDetails from "../../components/checkout/RecipientDetails";
import PaymentMethods from "../../components/checkout/PaymentMethods";
import CartSummary from "../../components/checkout/CartSummary";
import Spinner from "../../components/common/Spinner";
import LoadError from "../../components/common/LoadError";
import { calculateCartVat } from "../../utils/product";
import axios from "axios";
import { AuthFetch } from "../../components/auth/AuthFetch";
import {
  isPostalCodeValid,
  joinPostalCodeDigits,
} from "../../utils/postalCode";

const API_URL = process.env.REACT_APP_API_URL;

export default function DeliveryPage() {
  /* -------------------- 1.  STANY -------------------- */
  const { items, loading, error, retry, reloadCart } = useCart();
  const { user, authChecked } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);

  // spróbuj załadować poprzednio zapisany formularz
  const saved = localStorage.getItem("deliveryForm");
  const [form, setForm] = useState(
    saved
      ? JSON.parse(saved)
      : {
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
        }
  );

  const [postalDigits, setPostalDigits] = useState(["", "", "", "", ""]);
  const [dirty, setDirty] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("przelewy24");
  const [submitting, setSubmitting] = useState(false);

  /* -------------------- 2.  EFEKTY -------------------- */

  // 2a. prefill z kontekstu (imię, email itd.) — zostaw jak masz
  useEffect(() => {
    if (!authChecked || !user || dirty) return;
    const {
      name = "",
      surname = "",
      phone = "",
      email = "",
      street = "",
      apartmentNumber = "",
      city = "",
    } = user;
    setForm((f) => ({
      ...f,
      firstName: f.firstName || name,
      lastName: f.lastName || surname,
      phone: f.phone || phone,
      email: f.email || email,
      address: f.address || street,
      address2: f.address2 || apartmentNumber,
      city: f.city || city,
    }));
    // kod pocztowy z context.user może być pusty — nie ruszamy tu
  }, [authChecked, user, dirty]);

  // 2b. fetchujemy pełne dane (w tym adres/pkod) bezpośrednio z serwera
  useEffect(() => {
    if (!authChecked) return;
    (async () => {
      try {
        const res = await AuthFetch(`${API_URL}/api/users/me`);
        if (!res.ok) return;
        const data = await res.json();
        // nadpisujemy tylko te pola, które są w payloadzie
        setForm((f) => ({
          ...f,
          firstName: f.firstName || data.name,
          lastName: f.lastName || data.surname,
          phone: f.phone || data.phone,
          email: f.email || data.email,
          address: f.address || data.street,
          address2: f.address2 || data.apartmentNumber,
          city: f.city || data.city,
        }));
        if (data.postalCode) {
          const digits = data.postalCode
            .replace(/\D/g, "")
            .slice(0, 5)
            .split("");
          setPostalDigits(digits);
        }
      } catch (err) {
        // cichutko
      }
    })();
  }, [authChecked, reloadCart]);

  // 2c. pobranie metod dostawy…
  useEffect(() => {
    axios
      .get(`${API_URL}/api/shipping`)
      .then((res) => {
        const methods = res.data.methods || [];
        setShippingMethods(methods);
        if (methods.length) setSelectedShipping(methods[0]);
      })
      .catch(() => showAlert("Nie udało się pobrać metod dostawy", "error"));
  }, []);

  /* -------------------- 3.  OBLICZENIA POCHODNE -------------------- */
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const vat = calculateCartVat(items);
  const freeShippingThreshold = 230;
  const missing = freeShippingThreshold - total;

  /* -------------------- 4.  WCZESNE RETURN-y -------------------- */
  if (!authChecked) return <Spinner fullscreen />;
  if (loading) return <Spinner />;
  if (error) return <LoadError message={error} onRetry={retry} />;
  if (items.length === 0) return navigate("/koszyk");

  /* -------------------- 5.  HANDLERY I JSX -------------------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      localStorage.setItem("deliveryForm", JSON.stringify(next));
      return next;
    });
    setDirty(true);
  };

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
            <ShippingMethods
              shippingMethods={shippingMethods}
              selectedShipping={selectedShipping}
              setSelectedShipping={setSelectedShipping}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />

            <RecipientDetails
              form={form}
              handleChange={handleChange}
              postalDigits={postalDigits}
              handlePostalDigitChange={handlePostalDigitChange}
              handlePostalDigitKeyDown={handlePostalDigitKeyDown}
            />

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

            <PaymentMethods
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              selectedShipping={selectedShipping}
            />
          </form>

          <CartSummary
            items={items}
            selectedShipping={selectedShipping}
            total={total}
            vat={vat}
            missing={missing}
            form={form}
            handleChange={handleChange}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
