import React from "react";
import CartItemTile from "../cart/CartItemTile";
import { formatGrossPrice } from "../../utils/product";
import Button from "../common/Button";

export default function CartSummary({
  items,
  selectedShipping,
  total,
  vat,
  missing,
  form,
  handleChange,
  submitting,
  onSubmit,
  variant = "checkout", // 'checkout' lub 'preview'
}) {
  const isCheckout = variant === "checkout";

  return (
    <div className="cart-summary">
      {missing > 0 ? (
        <div className="free-shipping">
          Do darmowej dostawy brakuje <em>{formatGrossPrice(missing)} zł</em>
        </div>
      ) : (
        <div className="free-shipping free">Masz darmową dostawę!</div>
      )}

      {isCheckout && (
        <ul>
          {items.map(({ product, quantity }) => (
            <CartItemTile
              key={product.id}
              product={product}
              quantity={quantity}
            />
          ))}
        </ul>
      )}

      <div className="summary-total">
        {isCheckout && (
          <div className="brutto">
            <span>Produkty:</span>
            <strong>{formatGrossPrice(total)} zł</strong>
          </div>
        )}
        {isCheckout &&
          (() => {
            // jeśli przekroczyliśmy próg darmowej dostawy (missing <= 0), to koszt = 0
            const shippingCost =
              missing > 0 ? selectedShipping?.priceTotal ?? 0 : 0;
            return (
              <div className="brutto">
                <span>Dostawa:</span>
                <strong>
                  {missing > 0
                    ? `${formatGrossPrice(
                        selectedShipping?.priceTotal ?? 0
                      )} zł`
                    : "0 zł"}
                </strong>
              </div>
            );
          })()}

        <div className="summary-brutto">
          <span>Razem:</span>
          <strong>
            {formatGrossPrice(
              isCheckout
                ? total + (missing > 0 ? selectedShipping?.priceTotal ?? 0 : 0)
                : total
            )}{" "}
            zł
          </strong>
        </div>
        <div className="summary-vat">
          W tym VAT: <strong>{formatGrossPrice(vat)} zł</strong>
        </div>
      </div>

      {isCheckout ? (
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
            prywatności.
            <span className="required">*</span>
          </label>

          <Button type="submit" disabled={submitting}>
            Zamawiam
          </Button>
        </div>
      ) : (
        <Button onClick={onSubmit}>Zamówienie</Button>
      )}
    </div>
  );
}
