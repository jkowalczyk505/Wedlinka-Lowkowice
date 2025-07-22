// src/components/checkout/OrderSummaryDetails.jsx
import React from "react";
import { formatGrossPrice } from "../../utils/product";

export default function OrderSummaryDetails({
  form,
  shipping,
  payment,
  invoice,
}) {
  return (
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
          <strong>{formatGrossPrice(shipping.priceTotal || 0)} zł</strong>
        </p>

        {payment.method === "bank_transfer" && (
          <>
            <h4>Dane do przelewu</h4>
            <p>
              Tytuł przelewu: <strong>{payment.title}</strong>
            </p>
            <p>
              Kwota: <strong>{formatGrossPrice(payment.amount)} zł</strong>
            </p>
            <p>
              Nr konta: <code>{payment.bankAccount}</code>
            </p>
            <p>Bank: {process.env.REACT_APP_BANK_NAME}</p>
          </>
        )}
      </div>

      {/* Informacje dodatkowe / faktura */}
      <div className="detail-column">
        <h3>Informacje dodatkowe</h3>

        <p>
          <h4>Uwagi do zamówienia:</h4>{" "}
          {form.notes?.trim() ? form.notes : "Brak uwag"}
        </p>

        {invoice.type ? (
          <>
            <p>
              <h4>Faktura VAT:</h4>
            </p>
            {invoice.type === "person" ? (
              <p>{invoice.name}</p>
            ) : (
              <p>Nazwa: {invoice.name}</p>
            )}
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
  );
}
