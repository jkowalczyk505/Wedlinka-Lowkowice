// src/pages/CartPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../components/cart/CartContext";
import { useAuth } from "../components/auth/AuthContext";
import CartRow from "../components/cart/CartRow";
import Button from "../components/common/Button";
import { formatGrossPrice, calculateCartVat } from "../utils/product";
import { useAlert } from "../components/common/alert/AlertContext";
import { ShoppingBag, Trash2 } from "lucide-react";
import CheckoutSteps from "../components/common/CheckoutSteps";

const CartPage = () => {
  const { items, removeItem, clearCart, reloadCart, addItem, updateQuantity } =
    useCart();
  const { user } = useAuth();
  const [undoItem, setUndoItem] = useState(null);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const vatAmount = calculateCartVat(items);
  const freeShippingThreshold = 230;
  const missingAmount = freeShippingThreshold - total;

  const handleRemove = (productId) => {
    const entry = items.find((i) => i.product.id === productId);
    if (!entry) return;
    removeItem(productId);
    setUndoItem({
      product: entry.product,
      quantity: entry.quantity,
    });
    showAlert(`Usunięto: ${entry.product.name}`, "info");
  };

  const handleUndo = () => {
    if (!undoItem) return;
    const { product, quantity } = undoItem;
    addItem(product, quantity);
    setUndoItem(null);
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

        {undoItem && (
          <div className="undo-alert inline-alert">
            Usunięto: "{undoItem.product.name}".
            <Button variant="beige" onClick={handleUndo}>
              Cofnij
            </Button>
          </div>
        )}

        {/* ← renderujemy tylko jeśli nie ma usera */}
        {!user && (
          <p className="login-prompt">
            <span>Masz już konto? </span>
            <Link to="/logowanie">
              <Button variant="red">Zaloguj się</Button>
            </Link>
          </p>
        )}

        <div className="cart-layout">
          <div className="cart-items">
            <CartRow isHeader />

            {items.map(({ product, quantity }) => (
              <CartRow
                key={product.id}
                product={product}
                quantity={quantity}
                onQuantityChange={(q) => updateQuantity(product, q)}
                onRemove={handleRemove}
              />
            ))}

            <div className="cart-clear" onClick={clearCart}>
              <Trash2 size={16} /> <span>Wyczyść koszyk</span>
            </div>
          </div>

          <div className="cart-summary">
            {missingAmount > 0 ? (
              <div className="free-shipping">
                Do darmowej dostawy brakuje{" "}
                <em>{formatGrossPrice(missingAmount)} zł</em>
              </div>
            ) : (
              <div className="free-shipping free">Masz darmową dostawę!</div>
            )}

            <div className="summary-total">
              <div className="summary-brutto">
                <span>Łącznie:</span>
                <strong>{formatGrossPrice(total)} zł</strong>
              </div>

              <div className="summary-vat">
                W tym VAT: <strong>{formatGrossPrice(vatAmount)} zł</strong>
              </div>
            </div>

            <Button onClick={() => navigate("/dostawa")}>Zamówienie</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
