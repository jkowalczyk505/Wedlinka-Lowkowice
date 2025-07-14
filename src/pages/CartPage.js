import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../components/cart/CartContext";
import CartRow from "../components/cart/CartRow";
import QuantityStepper from "../components/common/QuantityStepper";
import Button from "../components/common/Button";
import { formatGrossPrice } from "../utils/product";
import { useAlert } from "../components/common/alert/AlertContext";
import { ShoppingBag, X } from "lucide-react";
import CheckoutSteps from "../components/common/CheckoutSteps";

const CartPage = () => {
  const { items, removeItem, clearCart, reloadCart, addItem, updateQuantity } =
    useCart();
  const [undoItem, setUndoItem] = useState(null);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const freeShippingThreshold = 230;
  const missingAmount = freeShippingThreshold - total;

  const handleRemove = (product) => {
    removeItem(product.id);
    setUndoItem(product);
    showAlert(`Usunięto: ${product.name}`, "info");
  };

  const handleUndo = () => {
    if (undoItem) {
      addItem(undoItem, 1);
      setUndoItem(null);
    }
  };

  useEffect(() => {
    reloadCart();
    // eslint-disable-next-line
  }, []);

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="cart-empty pattern-section">
          <CheckoutSteps currentStep={1} />
          <div className="empty-container">
            <ShoppingBag size={140} />
            <X size={40} />
            <p>Twój koszyk jest aktualnie pusty.</p>
            <Link to="/sklep">
              <Button variant="red">Wróć do sklepu</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="cart-page pattern-section">
        <CheckoutSteps currentStep={1} />
        <p className="login-prompt">
          <span>Masz już konto? </span>
          <Button as={Link} to="/logowanie" variant="red">
            Zaloguj się
          </Button>
        </p>

        <div className="cart-layout">
          {/* Produkty */}
          <div className="cart-items">
            {items.map(({ product, quantity }) => (
              <CartRow
                key={product.id}
                product={product}
                quantity={quantity}
                onQuantityChange={(q) => updateQuantity(product, q)}
                onRemove={handleRemove}
              />
            ))}

            <Button variant="red" onClick={clearCart}>
              Wyczyść koszyk
            </Button>
          </div>

          {/* Podsumowanie */}
          <div className="cart-summary">
            {missingAmount > 0 ? (
              <div className="free-shipping">
                Do darmowej dostawy brakuje {formatGrossPrice(missingAmount)} zł
              </div>
            ) : (
              <div className="free-shipping free">Masz darmową dostawę!</div>
            )}

            <div className="summary-total">
              <span>Łącznie:</span>
              <strong>{formatGrossPrice(total)} zł</strong>
            </div>

            <Button onClick={() => navigate("/dostawa")}>Zamówienie</Button>
          </div>
        </div>

        {undoItem && (
          <div className="undo-alert">
            Usunięto: {undoItem.name}{" "}
            <Button onClick={handleUndo}>Cofnij</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
