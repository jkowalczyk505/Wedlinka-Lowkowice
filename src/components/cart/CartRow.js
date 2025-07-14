import React from "react";
import PropTypes from "prop-types";
import { Trash2 } from "lucide-react";
import QuantityStepper from "../common/QuantityStepper";
import { formatGrossPrice, formatQuantity } from "../../utils/product";

export default function CartRow({
  product,
  quantity,
  onQuantityChange,
  onRemove,
  isHeader,
}) {
  return (
    <div className={`cart-row ${isHeader ? "cart-row--header" : ""}`}>
      <div className="cart-row__img">
        {isHeader ? (
          "PRODUKT"
        ) : (
          <img
            src={`${process.env.REACT_APP_API_URL}/uploads/products/${product.image}`}
            alt={product.name}
          />
        )}
      </div>

      <div className="cart-row__details">
        {isHeader ? null : (
          <>
            <div className="cart-row__name">{product.name}</div>
            <div className="cart-row__unit">
              {formatQuantity(product.quantityPerUnit)} {product.unit}
            </div>
          </>
        )}
      </div>

      <div className="cart-row__price">
        {isHeader ? "CENA" : `${formatGrossPrice(product.price)} zł`}
      </div>

      <div className="cart-row__qty">
        {isHeader ? (
          "ILOŚĆ"
        ) : (
          <QuantityStepper
            value={quantity}
            onChange={onQuantityChange}
            min={1}
          />
        )}
      </div>

      <div className="cart-row__total">
        {isHeader
          ? "KWOTA"
          : `${formatGrossPrice(product.price * quantity)} zł`}
      </div>

      <div className="cart-row__remove">
        {!isHeader && (
          <button onClick={() => onRemove(product.id)} aria-label="Usuń">
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

CartRow.propTypes = {
  product: PropTypes.object,
  quantity: PropTypes.number,
  onQuantityChange: PropTypes.func,
  onRemove: PropTypes.func,
  isHeader: PropTypes.bool,
};
