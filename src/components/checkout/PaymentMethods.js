import React from "react";
import InfoTip from "../common/InfoTip";

export default function PaymentMethods({
  paymentMethod,
  setPaymentMethod,
  selectedShipping,
}) {
  const isPickup = selectedShipping?.id === "pickup";
  const onlyCod = selectedShipping?.codSelected === true; // kurier za pobraniem
  const showCod = isPickup || onlyCod; // wyświetlać przy odbiorze

  const showOnline = !onlyCod; // ukryj online gdy onlyCod
  const showTransfer = !onlyCod; // ukryj przelew gdy onlyCod

  return (
    <div className="form-group">
      <h2 className="form-group-heading">Metoda płatności</h2>
      <div className="form-section">
        {showOnline && (
          <label className="radio">
            <input
              type="radio"
              name="paymentMethod"
              value="przelewy24"
              checked={paymentMethod === "przelewy24"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />{" "}
            Płatność online (BLIK, szybki przelew, karta) – przez Przelewy24
            {paymentMethod === "przelewy24" && (
              <InfoTip>
                Zostaniesz przekierowany do szybkiej płatności internetowej.
                Obsługiwane są m.in. BLIK, przelewy ekspresowe, karty płatnicze.
              </InfoTip>
            )}
          </label>
        )}

        {showTransfer && (
          <label className="radio">
            <input
              type="radio"
              name="paymentMethod"
              value="bank_transfer"
              checked={paymentMethod === "bank_transfer"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />{" "}
            Przelew tradycyjny (samodzielna wpłata na konto po złożeniu
            zamówienia)
            {paymentMethod === "bank_transfer" && (
              <InfoTip>
                Po złożeniu zamówienia otrzymasz dane do przelewu. Wyślemy je
                także na Twój adres e-mail.
              </InfoTip>
            )}
          </label>
        )}

        {showCod && (
          <label className="radio">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />{" "}
            Płatność przy odbiorze
          </label>
        )}
      </div>
    </div>
  );
}
