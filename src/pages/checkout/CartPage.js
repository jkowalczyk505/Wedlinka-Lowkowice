// src/pages/CartPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../components/cart/CartContext";
import { useAuth } from "../../components/auth/AuthContext";
import CartRow from "../../components/cart/CartRow";
import Button from "../../components/common/Button";
import LoadError from "../../components/common/LoadError";
import Spinner from "../../components/common/Spinner";
import { formatGrossPrice, calculateCartVat } from "../../utils/product";
import { useAlert } from "../../components/common/alert/AlertContext";
import { ShoppingBag, Trash2 } from "lucide-react";
import CheckoutSteps from "../../components/checkout/CheckoutSteps";
import CartSummary from "../../components/checkout/CartSummary";

const CartPage = () => {
  const {
    items,
    removeItem,
    clearCart,
    reloadCart,
    addItem,
    updateQuantity,
    loading,
    error,
    retry,
  } = useCart();
  const { user } = useAuth();
  const [undoItem, setUndoItem] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const vatAmount = calculateCartVat(items);
  const freeShippingThreshold = 230;
  const missingAmount = freeShippingThreshold - total;

  const handleRemove = async (productId) => {
    const entry = items.find((i) => i.product.id === productId);
    if (!entry) return;

    if (user) {
      setRemovingId(productId);
      try {
        await removeItem(productId);
        setUndoItem({ product: entry.product, quantity: entry.quantity });
        showAlert(`Usunięto: ${entry.product.name}`, "info");
      } catch {
        showAlert("Nie udało się usunąć pozycji z koszyka.", "error");
      } finally {
        setRemovingId(null);
      }
    } else {
      // guest → localStorage
      removeItem(productId);
      setUndoItem({ product: entry.product, quantity: entry.quantity });
      showAlert(`Usunięto: ${entry.product.name}`, "info");
    }
  };

  const handleClear = async () => {
    if (user) {
      setClearing(true);
      try {
        await clearCart();
        showAlert("Koszyk został wyczyszczony.", "info");
      } catch {
        showAlert("Nie udało się wyczyścić koszyka.", "error");
      } finally {
        setClearing(false);
      }
    } else {
      clearCart(); // guest
      showAlert("Koszyk został wyczyszczony.", "info");
    }
  };

  const handleUndo = () => {
    if (!undoItem) return;
    addItem(undoItem.product, undoItem.quantity);
    setUndoItem(null);
  };

  useEffect(() => {
    reloadCart();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <LoadError message={error} onRetry={retry} />;
  }

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
            Usunięto: „{undoItem.product.name}”.
            <Button variant="beige" onClick={handleUndo}>
              Cofnij
            </Button>
          </div>
        )}

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
                removing={removingId === product.id}
              />
            ))}

            <div className="cart-clear" onClick={handleClear}>
              {clearing ? (
                <Spinner size="small" />
              ) : (
                <>
                  <Trash2 size={16} /> <span>Wyczyść koszyk</span>
                </>
              )}
            </div>
          </div>

          <CartSummary
            items={items}
            total={total}
            vat={vatAmount}
            missing={missingAmount}
            variant="preview"
            onSubmit={() => navigate("/zamowienie")}
          />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
