// src/routes.js
import React from "react";
import { Navigate } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedLayout from "./components/auth/ProtectedLayout";
import AccountPage from "./pages/account/AccountPage";
import AccountDashboard from "./pages/account/AccountDashboard";
import OrdersPage from "./pages/account/OrdersPage";
import AccountDetails from "./pages/account/AccountDetails";
import AddressForm from "./pages/account/AddressForm";
import ChangePassword from "./pages/account/ChangePassword";
import ReviewList from "./pages/account/ReviewList";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";

export default [
  { path: "/", element: <HomePage /> },
  { path: "/logowanie", element: <AuthPage /> },

  {
    path: "/konto",
    element: <ProtectedLayout />, // ✔ sprawdza user + <Outlet/>
    children: [
      {
        element: <AccountPage />, // ✔ layout z sidebar + <Outlet/>
        children: [
          { index: true, element: <AccountDashboard /> },
          { path: "zamowienia", element: <OrdersPage /> },
          { path: "dane", element: <AccountDetails /> },
          { path: "adres", element: <AddressForm /> },
          { path: "haslo", element: <ChangePassword /> },
          { path: "opinie", element: <ReviewList /> },
          { path: "*", element: <Navigate to="/konto" replace /> },
        ],
      },
    ],
  },

  // ewentualnie catch-all 404
  { path: "*", element: <NotFoundPage /> },
];
