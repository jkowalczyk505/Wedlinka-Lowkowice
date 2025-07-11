import React from "react";
import { useCart } from "./CartContext";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import { ReactComponent as DefaultIcon } from "../../assets/szynka-ikona.svg";

const CartDrawer = ({ isOpen, onClose }) => {
  const { items, removeItem } = useCart();

  const total = items.reduce((sum, i) => {
    if (!i?.product) return sum;
    const price = i.product.price_net * (1 + i.product.vat_rate / 100);
    return sum + price * i.quantity;
  }, 0);

  const validItems = items.filter((i) => i?.product);
  const isEmpty = validItems.length === 0;

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
          {isEmpty ? (
            <li className="empty-message">Brak produktów w koszyku.</li>
          ) : (
            validItems.map(({ product, quantity }) => (
              <li key={product.id}>
                <div className="item-left">
                  {product.image ? (
                    <img
                      src={`${process.env.REACT_APP_API_URL}/uploads/products/${product.image}`}
                      alt={product.name}
                    />
                  ) : (
                    <DefaultIcon className="product-image default-icon" />
                  )}

                  <div className="item-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-qty">
                      {quantity} ×{" "}
                      {(
                        product.price_net *
                        (1 + product.vat_rate / 100)
                      ).toFixed(2)}{" "}
                      zł
                    </div>
                  </div>
                </div>
                <button
                  className="remove-button"
                  onClick={() => removeItem(product.id)}
                >
                  ×
                </button>
              </li>
            ))
          )}
        </ul>

        {!isEmpty && (
          <div className="cart-footer">
            <div className="total">
              Łączna kwota: <em>{total.toFixed(2)} zł</em>
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
