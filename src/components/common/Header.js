import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { CiUser, CiShoppingCart, CiLogout } from "react-icons/ci";
import { useAuth } from "../auth/AuthContext";
import { logout } from "../auth/AuthUtils";
import CartDrawer from "../cart/CartDrawer";
import { useCart } from "../cart/CartContext";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser, setLogoutInProgress } = useAuth();
  const { items } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const API_URL = process.env.REACT_APP_API_URL;

  const handleAccountClick = () => {
    navigate(user ? "/konto" : "/logowanie");
  };

  const handleLogout = () => {
    setLogoutInProgress(true);
    logout(setUser);
  };

  const navItems = [
    { to: "/", label: "Strona główna" },
    { to: "/sklep/kielbasy", label: "Kiełbasy" },
    { to: "/sklep/wedliny", label: "Wędliny" },
    { to: "/sklep/wyroby-podrobowe", label: "Wyroby podrobowe" },
    { to: "/sklep/nasze-paczki", label: "Nasze paczki" },
    { to: "/kontakt", label: "Kontakt" },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo-wrapper">
          <NavLink to="/">
            <img src={logo} alt="logo" />
          </NavLink>
        </div>

        <nav id="main-nav" className={menuOpen ? "open" : ""}>
          <ul className="menu" onClick={() => setMenuOpen(false)}>
            {navItems.map(({ to, label }) => (
              <li className="menu-item" key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="account-icons">
          <button className="account-button" onClick={() => setCartOpen(true)}>
            <div className="cart-icon-wrapper">
              <CiShoppingCart />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </div>
            <span>Koszyk</span>
          </button>

          <button className="account-button" onClick={handleAccountClick}>
            <CiUser />
            Konto
          </button>

          {user && (
            <button className="account-button" onClick={handleLogout}>
              <CiLogout />
              Wyloguj
            </button>
          )}
        </div>
      </div>
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}

export default Header;
