// src/pages/account/AccountPage.js
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Home, User, Lock, Star, ListOrdered, MapPin } from "lucide-react"; // nowy zestaw ikon

const AccountPage = () => {
  return (
    <div className="white-section account-page-container">
      {/* Sidebar */}
      <aside className="account-sidebar">
        <h2>Moje Konto</h2>
        <nav>
          <NavLink
            to="/konto"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Home size={25} /> Panel główny
          </NavLink>
          <NavLink
            to="/konto/zamowienia"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <ListOrdered size={25} /> Moje zamówienia
          </NavLink>
          <NavLink
            to="/konto/dane"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <User size={25} /> Dane osobowe
          </NavLink>
          <NavLink
            to="/konto/adres"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <MapPin size={25} /> Mój adres
          </NavLink>
          <NavLink
            to="/konto/haslo"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Lock size={25} /> Zmiana hasła
          </NavLink>
          <NavLink
            to="/konto/opinie"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Star size={25} /> Moje opinie
          </NavLink>
        </nav>
      </aside>

      {/* Dynamiczna zawartość */}
      <main className="account-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AccountPage;
