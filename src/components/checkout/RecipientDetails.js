import React from "react";
import PostalCodeInput from "../common/PostalCodeInput";

export default function RecipientDetails({
  form,
  handleChange,
  postalDigits,
  handlePostalDigitChange,
  handlePostalDigitKeyDown,
}) {
  return (
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
            value={form.firstName}
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
            value={form.lastName}
          />
        </div>

        <div className="form-row">
          <label htmlFor="address">
            Ulica i numer domu <span className="required">*</span>
          </label>
          <input
            id="address"
            name="address"
            required
            onChange={handleChange}
            value={form.address}
            placeholder="Nazwa ulicy, numeru budynku, np. Akacjowa 42"
          />
        </div>

        <div className="form-row">
          <label htmlFor="address2">Numer mieszkania</label>
          <input
            id="address2"
            name="address2"
            onChange={handleChange}
            value={form.address2}
            placeholder="Numer mieszkania (opcjonalnie)"
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
            value={form.city}
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
            value={form.phone}
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
            value={form.email}
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
              <label htmlFor="companyName">Nazwa firmy (opcjonalnie)</label>
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
  );
}
