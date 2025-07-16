// src/pages/account/AccountDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import { Link } from "react-router-dom";
import {
  User,
  MapPin,
  Mail,
  AtSign,
} from "lucide-react";
import Button from "../../components/common/Button";
import InfoTip from "../../components/common/InfoTip";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CartItemTile from "../../components/cart/CartItemTile";
import { useAlert } from "../../components/common/alert/AlertContext";

const API_URL = process.env.REACT_APP_API_URL;

const AccountDashboard = () => {
  const { user, setLogoutInProgress, logout, setUser } = useAuth();

  const [stats, setStats] = useState({ total: 0, pending: 0, unpaid: 0 });
  const [cartItems, setCartItems] = useState([]);
  const cartPreview = cartItems.slice(0, 3);
  const [invoices, setInvoices] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    // statystyki zamówień
    fetch("/api/orders/stats", { credentials: "include" })
      .then((r) => r.json())
      .then((d) =>
        setStats({
          total: d.totalOrders,
          pending: d.pendingOrders,
          unpaid: d.unpaidOrders,
        })
      )
      .catch(() => {});

    // pobierz 2 produkty z koszyka
    fetch(`${API_URL}/api/cart`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) =>
        setCartItems(
          d.items.map((item) => ({
            product: {
              id: item.product_id,
              name: item.name,
              price: parseFloat(item.price_brut),
              unit: item.unit,
              image: item.image,
              slug: item.slug,
              category: item.category,
              is_available: !!item.is_available,
              is_deleted: !!item.is_deleted,
            },
            quantity: item.quantity,
          }))
        )
      )

      .catch(() => {});

    // pobierz 2 ostatnie faktury
    fetch("/api/invoices?limit=2", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setInvoices(d.slice(0, 2)))
      .catch(() => {});
  }, []);

  return (
    <div className="account-dashboard">
      <h1>Witaj, {user?.name || "Kliencie"}!</h1>
      <p className="welcome-text">
        Tutaj znajdziesz podsumowanie swojego konta i szybkie skróty.
      </p>

      {/* ▷ Zamówienia */}
      <section className="order-summary">
        <h2>Twoje zamówienia</h2>
        <p>....</p>
        <Link to="/konto/zamowienia">
          <Button variant="beige">Przeglądaj zamówienia</Button>
        </Link>
      </section>

      {/* ▷ Koszyk */}
      <section className="cart-preview">
        <h2>Twój koszyk</h2>
        <ul className="cart-items">
          {cartPreview.length === 0 ? (
            <li className="empty-message">Koszyk jest pusty.</li>
          ) : (
            cartPreview.map((item) => (
              <CartItemTile
                key={item.product.id}
                product={item.product}
                quantity={item.quantity}
                onRemove={null}
                onClick={null}
              />
            ))
          )}
        </ul>
        {cartItems.length > 3 && (
          <Link to="/koszyk">
            <Button variant="beige">Pokaż więcej</Button>
          </Link>
        )}
      </section>

      {/* ▷ Dane i adres */}
      <section className="profile-info">
        <h2>Moje dane i adres</h2>
        <div className="profile-columns">
          {/* Kolumna: dane osobowe */}
          <div className="profile-left">
            <ul>
              <li>
                <User size={25} /> {user?.name} {user?.surname}
              </li>
              <li>
                <AtSign size={25} /> {user?.email}
              </li>
            </ul>
            <Button as={Link} to="/konto/dane" variant="beige">
              Edytuj dane
            </Button>
          </div>

          {/* Kolumna: adres */}
          <div className="profile-right">
            <ul>
              <li>
                <MapPin size={25} /> {user?.street}{" "}
                {user?.apartmentNumber || ""}
              </li>
              <li>
                <Mail size={25} /> {user?.postalCode} {user?.city}
              </li>
            </ul>
            <Button as={Link} to="/konto/adres" variant="beige">
              Edytuj adres
            </Button>
          </div>
        </div>
      </section>

      {/* ▷ Faktury */}
      <section className="invoices-preview">
        <h2>Faktury</h2>
        <p>............</p>
        <Button as={Link} to="/konto/zamowienia" variant="beige">
          Więcej faktur
        </Button>
      </section>

      {/* ▷ Usuwanie konta */}
      <section className="account-delete">
        <h2>Usuń konto</h2>
        <InfoTip>Usunięcie konta jest nieodwracalne!</InfoTip>
        <Button variant="beige" onClick={() => setShowConfirm(true)}>
          Usuń konto
        </Button>
      </section>
      {showConfirm && (
        <ConfirmDialog
          text="Czy na pewno chcesz usunąć swoje konto? Tej operacji nie można cofnąć."
          onCancel={() => setShowConfirm(false)}
          onConfirm={async () => {
            try {
              setLogoutInProgress(true); // ⬅️ bardzo ważne!

              const res = await fetch(`${API_URL}/api/users/me`, {
                method: "DELETE",
                credentials: "include",
              });

              if (res.status === 204) {
                logout(setUser); // ⬅️ ładne czyszczenie + przekierowanie
              } else {
                const data = await res.json();
                alert(data.error || "Błąd podczas usuwania konta.");
                setLogoutInProgress(false); // fallback
              }
            } catch {
              alert("Nie udało się połączyć z serwerem.");
              setLogoutInProgress(false); // fallback
            } finally {
              setShowConfirm(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default AccountDashboard;
