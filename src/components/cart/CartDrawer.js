// src/components/cart/CartDrawer.jsx
import React, { useEffect } from "react";
import { useCart } from "./CartContext";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import LoadError from "../common/LoadError";
import Spinner from "../common/Spinner";
import { ReactComponent as DefaultIcon } from "../../assets/szynka-ikona.svg";
import {
  categoryToSlug,
  formatQuantity,
  formatGrossPrice,
} from "../../utils/product";

const CartDrawer = ({ isOpen, onClose }) => {
  const { items, removeItem, reloadCart, loading, error } = useCart();

  const total = items.reduce((sum, i) => {
    if (!i?.product || i.product.price == null) return sum;
    return sum + i.product.price * i.quantity;
  }, 0);

  const validItems = items.filter(
    (i) =>
      i?.product &&
      i.product.is_available !== false &&
      i.product.is_deleted !== true
  );
  const isEmpty = validItems.length === 0;

  const CartItemImage = ({ src, alt }) => {
    const [hasError, setHasError] = React.useState(false);
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

  useEffect(() => {
    if (isOpen) reloadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={onClose} />}
      <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <ul className="cart-items">
          {error ? (
            <li className="error-message">
              <LoadError message={error} onRetry={reloadCart} />
            </li>
          ) : loading ? (
            <li className="loading-message">
              <Spinner size="small" />
            </li>
          ) : isEmpty ? (
            <li className="empty-message">Brak produktów w koszyku.</li>
          ) : (
            validItems.map(({ product, quantity }) => {
              const catSlug = categoryToSlug(product.category);
              return (
                <li key={product.id}>
                  <Link
                    to={`/sklep/${catSlug}/${product.slug}`}
                    className="item-left link-reset"
                    onClick={onClose}
                  >
                    <CartItemImage
                      src={`${process.env.REACT_APP_API_URL}/uploads/products/${product.image}`}
                      alt={product.name}
                    />
                    <div className="item-info">
                      <div className="product-name">{product.name}</div>
                      <div className="product-unit">
                        Ilość: {formatQuantity(product.quantity)} {product.unit}
                      </div>
                      <div className="product-qty">
                        {quantity} ×{" "}
                        {product.price != null
                          ? `${formatGrossPrice(product.price)} zł`
                          : "- zł"}
                      </div>
                    </div>
                  </Link>
                  <button
                    className="remove-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(product.id);
                    }}
                  >
                    ×
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {!isEmpty && !loading && !error && (
          <div className="cart-footer">
            <div className="total">
              <em>
                <span>Łączna kwota: </span>
                <span>{formatGrossPrice(total)} zł</span>
              </em>
              <span>z VAT</span>
            </div>
            <Link to="/koszyk" onClick={onClose}>
              <Button variant="red">Przejdź do koszyka</Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
