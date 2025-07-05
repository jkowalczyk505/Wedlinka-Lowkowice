// src/pages/account/AccountDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import { Link } from "react-router-dom";
import {
  ListOrdered,
  Clock,
  AlertCircle,
  ShoppingCart,
  MoreHorizontal,
  User,
  MapPin,
  Key,
  FileText,
} from "lucide-react";

const AccountDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({ total: 0, pending: 0, unpaid: 0 });
  const [cartItems, setCartItems] = useState([]);
  const [invoices, setInvoices] = useState([]);

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
    fetch("/api/cart", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCartItems(d.items.slice(0, 2)))
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
        <div className="summary-cards">
          <div className="card">
            <ListOrdered size={28} />
            <div>
              <h3>{stats.total}</h3>
              <p>Wszystkie</p>
            </div>
          </div>
          <div className="card">
            <Clock size={28} />
            <div>
              <h3>{stats.pending}</h3>
              <p>Oczekujące</p>
            </div>
          </div>
          <div className="card">
            <AlertCircle size={28} />
            <div>
              <h3>{stats.unpaid}</h3>
              <p>Niezapłacone</p>
            </div>
          </div>
        </div>
        <Link to="/konto/zamowienia" className="btn btn-primary">
          Przeglądaj zamówienia
        </Link>
      </section>

      {/* ▷ Koszyk */}
      <section className="cart-preview">
        <h2>Twój koszyk</h2>
        <ul className="cart-items">
          {cartItems.map((item) => (
            <li key={item.product.id}>
              <ShoppingCart size={20} />
              <span>
                {item.product.name} × {item.quantity}
              </span>
            </li>
          ))}
        </ul>
        <Link to="/koszyk" className="btn-icon">
          <MoreHorizontal size={24} aria-label="Przejdź do koszyka" />
        </Link>
      </section>

      {/* ▷ Dane i adres */}
      <section className="profile-info">
        <h2>Moje dane i adres</h2>
        <ul>
          <li>
            <User size={16} /> {user?.name} {user?.surname}
          </li>
          <li>
            <Key size={16} /> {user?.email}
          </li>
          <li>
            <MapPin size={16} /> {user?.phone}
          </li>
        </ul>
        <div className="profile-actions">
          <Link to="/konto/dane" className="btn btn-secondary">
            Edytuj dane
          </Link>
          <Link to="/konto/adres" className="btn btn-secondary">
            Edytuj adres
          </Link>
        </div>
      </section>

      {/* ▷ Faktury */}
      <section className="invoices-preview">
        <h2>Faktury</h2>
        <ul className="invoice-list">
          {invoices.map((inv) => (
            <li key={inv.id}>
              <FileText size={20} />
              <span>
                {inv.number} z {new Date(inv.issue_date).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
        <Link to="/konto/zamowienia" className="btn-icon">
          <MoreHorizontal size={24} aria-label="Więcej faktur" />
        </Link>
      </section>
    </div>
  );
};

export default AccountDashboard;
