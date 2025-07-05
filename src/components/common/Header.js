import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { CiUser, CiShoppingCart } from "react-icons/ci";
import { useAuth } from "../auth/AuthContext";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // <-- pobieramy użytkownika

  const handleAccountClick = () => {
    navigate(user ? "/konto" : "/logowanie");
  };

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
            <li className="menu-item">
              <NavLink
                to="/kielbasy"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                Kiełbasy
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/wedliny"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                Wędliny
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/wyroby-podrobowe"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                Wyroby podrobowe
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/nasze-paczki"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                Nasze paczki
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/kontakt"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                Kontakt
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="account-icons">
          <NavLink to="/koszyk">
            <CiShoppingCart />
            Koszyk
          </NavLink>
          <button className="account-button" onClick={handleAccountClick}>
            <CiUser />
            Konto
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
