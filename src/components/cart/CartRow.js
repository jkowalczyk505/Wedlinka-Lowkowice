// src/components/cart/CartRow.jsx
import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import QuantityStepper from "../common/QuantityStepper";
import Spinner from "../common/Spinner";
import {
  formatGrossPrice,
  formatQuantity,
  categoryToSlug,
} from "../../utils/product";

export default function CartRow({
  product,
  quantity,
  onQuantityChange,
  onRemove,
  isHeader,
  removing = false,
  readOnly = false, // ← nowy prop
}) {
  let productLink = "";
  if (!isHeader) {
    const catSlug = categoryToSlug(product.category);
    productLink = `/sklep/${catSlug}/${product.slug}`;
  }

  return (
    <div className={`cart-row ${isHeader ? "cart-row--header" : ""}`}>
      <div className="cart-row__img">
        {isHeader ? (
          "PRODUKT"
        ) : (
          <Link to={productLink} className="link-reset">
            <img
              src={`${process.env.REACT_APP_API_URL}/uploads/products/${product.image}`}
              alt={product.name}
            />
          </Link>
        )}
      </div>

      <div className="cart-row__details">
        {!isHeader && (
          <>
            <Link to={productLink} className="cart-row__name link-reset">
              {product.name}
            </Link>
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
        ) : readOnly ? (
          quantity // ← tylko wyświetlamy liczbę
        ) : (
          <QuantityStepper
            value={quantity}
            onChange={onQuantityChange}
            min={1}
            disabled={removing}
          />
        )}
      </div>

      <div className="cart-row__total">
        {isHeader
          ? "KWOTA"
          : `${formatGrossPrice(product.price * quantity)} zł`}
      </div>

      <div className="cart-row__remove">
        {!isHeader &&
          !readOnly && ( // ← ukrywamy, jeśli readOnly
            <button
              onClick={() => onRemove(product.id)}
              aria-label="Usuń"
              disabled={removing}
            >
              {removing ? <Spinner size="small" /> : <Trash2 size={13} />}
            </button>
          )}
      </div>
    </div>
  );
}

CartRow.propTypes = {
  product: PropTypes.shape({
    category: PropTypes.string,
    slug: PropTypes.string,
    image: PropTypes.string,
    name: PropTypes.string,
    price: PropTypes.number,
    quantityPerUnit: PropTypes.number,
    unit: PropTypes.string,
  }),
  quantity: PropTypes.number,
  onQuantityChange: PropTypes.func,
  onRemove: PropTypes.func,
  isHeader: PropTypes.bool,
  removing: PropTypes.bool,
  readOnly: PropTypes.bool,
};
