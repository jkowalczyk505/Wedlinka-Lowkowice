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
          lockerCode: "",
        }
  );

  const [postalDigits, setPostalDigits] = useState(["", "", "", "", ""]);
  const [dirty, setDirty] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("przelewy24");
  const [submitting, setSubmitting] = useState(false);

  /* -------------------- 2.  EFEKTY -------------------- */

  // 2a. prefill z kontekstu (imię, email itd.)
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
  }, [authChecked, user, dirty]);

  // 2b. fetchujemy z serwera
  useEffect(() => {
    if (!authChecked) return;
    (async () => {
      try {
        const res = await AuthFetch(`${API_URL}/api/users/me`);
        if (!res.ok) return;
        const data = await res.json();
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
      } catch {}
    })();
  }, [authChecked, reloadCart]);

  // 2c. pobranie metod dostawy
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

  useEffect(() => {
    if (!selectedShipping) return;

    if (selectedShipping.codSelected) {
      // „kurier (za pobraniem)”
      setPaymentMethod("cod");
    } else if (selectedShipping.id === "pickup") {
      setPaymentMethod("cod");
    } else {
      setPaymentMethod("przelewy24");
    }
  }, [selectedShipping]);

  /* -------------------- 3.  OBLICZENIA -------------------- */
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const vat = calculateCartVat(items);
  const freeShippingThreshold = 230;
  const missing = freeShippingThreshold - total;

  /* -------------------- 4.  WCZESNE RETURN-y -------------------- */
  if (!authChecked) return <Spinner fullscreen />;
  if (loading) return <Spinner />;
  if (error) return <LoadError message={error} onRetry={retry} />;
  if (items.length === 0) return navigate("/koszyk");

  /* -------------------- 5.  HANDLERY -------------------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = value;
    if (name === "phone") {
      nextValue = value.replace(/\D/g, "").slice(0, 9);
    }
    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : nextValue,
      };
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Regulamin
    if (!form.acceptTerms) {
      showAlert("Zaakceptuj regulamin i politykę prywatności", "error");
      return;
    }

    // 2. Kod pocztowy
    const fullPostalCode = joinPostalCodeDigits(postalDigits);
    if (!isPostalCodeValid(fullPostalCode)) {
      showAlert("Kod pocztowy musi być w formacie 12-345.", "error");
      return;
    }
    const formWithZip = { ...form, zip: fullPostalCode };

    // 3. Kod paczkomatu (jeśli paczkomat)
    if (selectedShipping?.id === "inpost" && !form.lockerCode.trim()) {
      showAlert("Podaj kod paczkomatu.", "error");
      return;
    }

    // 4. Faktura: none/person/company
    let invoiceType = "none";
    if (form.wantsInvoice) {
      const hasCompany = !!form.companyName.trim();
      const hasNip = !!form.nip.trim();
      if (hasCompany || hasNip) {
        if (!hasCompany || !hasNip) {
          showAlert(
            "Podaj zarówno nazwę firmy, jak i NIP, aby wystawić fakturę na firmę.",
            "error"
          );
          return;
        }
        invoiceType = "company";
      } else {
        invoiceType = "person";
      }
    }

    setSubmitting(true);

    // 5. Payload
    const orderPayload = {
      items: items.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      })),
      selectedShipping: {
        ...selectedShipping,
        priceTotal: missing > 0 ? selectedShipping.priceTotal : 0,
        codSelected: !!selectedShipping.id.includes("_cod"),
      },
      lockerCode: form.lockerCode,
      paymentMethod,
      invoiceType,
      form: formWithZip,
    };

    try {
      const res = await (user ? AuthFetch : fetch)(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Błąd podczas składania zamówienia");
      }

      // 6. Sprzątanie formularza
      localStorage.removeItem("deliveryForm");

      /* 7. Przekierowanie / podsumowanie */
      const { orderNumber, accessToken, payment } = data;

      if (payment.method === "przelewy24" && payment.redirectUrl) {
        window.location.href = payment.redirectUrl;
      } else {
        // NAJPIERW przekieruj
        navigate(`/podsumowanie?order=${orderNumber}&token=${accessToken}`);

        // POTEM (asynchronicznie) wyczyść koszyk
        setTimeout(() => {
          if (user) {
            AuthFetch(`${API_URL}/api/cart`, { method: "DELETE" });
          } else {
            localStorage.removeItem("cart");
          }
          reloadCart(); // kontekst
        }, 200);
      }
    } catch (err) {
      showAlert(err.message, "error");
    } finally {
      setSubmitting(false);
    }
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

        <div className="cart-layout" id="delivery">
          <form className="cart-form" onSubmit={handleSubmit}>
            <div className="form-wrapper cart-items">
              <ShippingMethods
                shippingMethods={shippingMethods}
                selectedShipping={selectedShipping}
                setSelectedShipping={setSelectedShipping}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                missing={missing}
                lockerCode={form.lockerCode}
                onLockerCodeChange={handleChange}
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
            </div>

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
          </form>
        </div>
      </div>
    </div>
  );
}
