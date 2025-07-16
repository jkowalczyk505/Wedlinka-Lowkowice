import React from "react";
import InfoTip from "../common/InfoTip";

export default function PaymentMethods({
  paymentMethod,
  setPaymentMethod,
  selectedShipping,
}) {
  const isCODAllowed = selectedShipping?.id?.includes("pickup");

  return (
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
          Płatność online (BLIK, szybki przelew, karta) – przez Przelewy24
          {paymentMethod === "przelewy24" && (
            <InfoTip>
              Zostaniesz przekierowany do szybkiej płatności internetowej.
              Obsługiwane są m.in. BLIK, przelewy ekspresowe, karty płatnicze.
            </InfoTip>
          )}
        </label>

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

        <label className={`radio ${!isCODAllowed ? "disabled" : ""}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={paymentMethod === "cod"}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={!isCODAllowed}
          />{" "}
          Płatność przy odbiorze
        </label>
      </div>
    </div>
  );
}
