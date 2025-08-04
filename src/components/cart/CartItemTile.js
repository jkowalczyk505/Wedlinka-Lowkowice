import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as DefaultIcon } from "../../assets/szynka-ikona.svg";
import {
  categoryToSlug,
  formatQuantity,
  formatGrossPrice,
} from "../../utils/product";

const CartItemImage = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);
  if (!src || hasError)
    return <DefaultIcon className="product-image default-icon" />;
  return (
    <img
      src={src}
      alt={alt}
      className="product-image"
      onError={() => setHasError(true)}
    />
  );
};

const CartItemTile = ({ product, quantity, onRemove, onClick }) => {
  const catSlug = categoryToSlug(product.category);
  const productLink = `/sklep/${catSlug}/${product.slug}`;

  return (
    <li className="cart-item-tile">
      <Link to={productLink} className="item-left link-reset" onClick={onClick}>
        <CartItemImage
          src={`${process.env.REACT_APP_API_URL}/api/uploads/products/${product.image}`}
          alt={product.name}
        />
        <div className="item-info">
          <div className="product-name">{product.name}</div>
          <div className="product-unit">
            Ilość: {formatQuantity(product.quantityPerUnit)} {product.unit}
          </div>

          <div className="product-qty">
            {quantity} ×{" "}
            {product.price != null
              ? `${formatGrossPrice(product.price)} zł`
              : "- zł"}
          </div>
        </div>
      </Link>
      {onRemove && (
        <button
          className="remove-button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(product.id);
          }}
        >
          ×
        </button>
      )}
    </li>
  );
};

export default CartItemTile;
