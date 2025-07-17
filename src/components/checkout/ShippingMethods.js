import React from "react";
import { formatGrossPrice } from "../../utils/product";

export default function ShippingMethods({
  shippingMethods,
  selectedShipping,
  setSelectedShipping,
  paymentMethod,
  setPaymentMethod,
  missing,
  lockerCode,
  onLockerCodeChange,
}) {
  const handleShippingChange = (option) => {
    setSelectedShipping(option);
    if (paymentMethod === "cod" && !option.id.includes("pickup")) {
      setPaymentMethod("przelewy24");
    }
  };

  return (
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
          .map((option) => {
            // jeśli przekroczyłeś próg darmowej dostawy wyświetlamy 0 zł
            const displayPrice = missing > 0 ? option.priceTotal : 0;
            return (
              <label className="radio" key={option.id}>
                <input
                  type="radio"
                  name="shipping"
                  value={option.id}
                  checked={selectedShipping?.id === option.id}
                  onChange={() => handleShippingChange(option)}
                />
                {option.label} –{" "}
                <span
                  className={
                    displayPrice === 0
                      ? "shipping-price free"
                      : "shipping-price"
                  }
                >
                  {formatGrossPrice(displayPrice)} zł
                </span>
              </label>
            );
          })}
        {selectedShipping?.id === "inpost" && (
          <div className="form-row locker-code">
            <label htmlFor="lockerCode">
              Kod paczkomatu <span className="required">*</span>
            </label>
            <input
              id="lockerCode"
              name="lockerCode"
              value={lockerCode}
              onChange={onLockerCodeChange}
              required
              placeholder="np. WIR01ML"
            />
          </div>
        )}
      </div>
    </div>
  );
}
