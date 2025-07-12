// src/components/cart/CartDrawer.jsx
import React, { useEffect } from "react";
import { useCart } from "./CartContext";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import LoadError from "../common/LoadError";
import Spinner from "../common/Spinner";
import CartItemTile from "./CartItemTile";
import { formatGrossPrice } from "../../utils/product";

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
            validItems.map(({ product, quantity }) => (
              <CartItemTile
                key={product.id}
                product={product}
                quantity={quantity}
                onRemove={removeItem}
                onClick={onClose}
              />
            ))
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
