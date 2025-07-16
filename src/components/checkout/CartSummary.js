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
}) {
  return (
    <div className="cart-summary">
      {missing > 0 ? (
        <div className="free-shipping">
          Do darmowej dostawy brakuje <em>{formatGrossPrice(missing)} zł</em>
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
            {formatGrossPrice(total + (selectedShipping?.priceTotal ?? 0))} zł
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
          prywatności.
          <span className="required">*</span>
        </label>

        <Button type="submit" disabled={submitting}>
          Kupuję i płacę
        </Button>
      </div>
    </div>
  );
}
