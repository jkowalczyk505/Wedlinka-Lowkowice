// src/components/cart/CartRow.jsx
import React from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";
import QuantityStepper from "../common/QuantityStepper";
import { formatGrossPrice } from "../../utils/product";

export default function CartRow({
  product,
  quantity,
  onQuantityChange,
  onRemove,
}) {
  return (
    <div className="cart-row">
      {/* obrazek */}
      <div className="cart-row__img">
        <img
          src={`${process.env.REACT_APP_API_URL}/uploads/products/${product.image}`}
          alt={product.name}
        />
      </div>

      {/* nazwa + jednostkowa cena */}
      <div className="cart-row__details">
        <div className="cart-row__name">{product.name}</div>
        <div className="cart-row__price">
          {formatGrossPrice(product.price)} zł
        </div>
      </div>

      {/* licznik */}
      <div className="cart-row__qty">
        <QuantityStepper value={quantity} onChange={onQuantityChange} min={1} />
      </div>

      {/* suma pozycji */}
      <div className="cart-row__total">
        {formatGrossPrice(product.price * quantity)} zł
      </div>

      {/* usuń */}
      <button
        className="cart-row__remove"
        onClick={() => onRemove(product.id)}
        aria-label="Usuń produkt"
      >
        <X size={16} />
      </button>
    </div>
  );
}

CartRow.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    image: PropTypes.string,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  quantity: PropTypes.number.isRequired,
  onQuantityChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};
