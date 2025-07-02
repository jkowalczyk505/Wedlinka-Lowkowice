import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import { CiUser, CiShoppingCart } from "react-icons/ci";

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <header className="header">
            <div className="header-inner">
                <div className="logo-wrapper">
                    <img src={logo} alt="logo"></img>
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
                    <NavLink to="/konto">
                        <CiUser />
                        Konto
                    </NavLink>
                </div>

            </div>
        </header>
    );
}

export default Header;