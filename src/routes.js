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
import AccountReviews from "./pages/account/AccountReviews";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ContactPage from "./pages/ContactPage";
import CategoryPage from "./pages/CategoryPage";
import AllProductsPage from "./pages/AllProductsPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/checkout/CartPage";
import DeliveryPage from "./pages/checkout/DeliveryPage";
import CheckoutSummaryPage from "./pages/checkout/CheckoutSummaryPage";
import ReturnComplaintsPage from "./pages/ReturnComplaintsPage";
import DeliveryInfoPage from "./pages/DeliveryInfoPage";
import OurStoresPage from "./pages/OurStoresPage";

import AdminLayout from "./components/auth/AdminLayout";
import AdminPage from "./pages/admin/AdminPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminShipping from "./pages/admin/AdminShipping";

export default [
  { path: "/", element: <HomePage /> },
  { path: "/reklamacje", element: <ReturnComplaintsPage /> },
  { path: "/informacje-o-dostawie", element: <DeliveryInfoPage /> },
  { path: "/logowanie", element: <AuthPage /> },
  { path: "/kontakt", element: <ContactPage /> },
  { path: "/nasze-sklepy", element: <OurStoresPage /> },
  {
    path: "/sklep/:categorySlug/:productSlug",
    element: <ProductPage />,
  },
  {
    path: "/sklep/:slug",
    element: <CategoryPage />,
  },
  {
    path: "/sklep",
    element: <AllProductsPage />,
  },
  {
    path: "/koszyk",
    element: <CartPage />,
  },
  {
    path: "/zamowienie",
    element: <DeliveryPage />,
  },
  {
    path: "/podsumowanie",
    element: <CheckoutSummaryPage />,
  },
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
          { path: "opinie", element: <AccountReviews /> },
          { path: "*", element: <Navigate to="/konto" replace /> },
        ],
      },
    ],
  },

  // ↓ DODAJ PRZED sekcją 404
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        element: <AdminPage />, // layout z sidebarem
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "produkty", element: <AdminProducts /> },
          { path: "zamowienia", element: <AdminOrders /> },
          { path: "opinie", element: <AdminReviews /> },
          { path: "faktury", element: <AdminInvoices /> },
          { path: "koszty-wysylek", element: <AdminShipping /> },
          { path: "*", element: <Navigate to="/admin" replace /> },
        ],
      },
    ],
  },

  // ewentualnie catch-all 404
  { path: "/404", element: <NotFoundPage /> },
  { path: "*", element: <Navigate to="/404" replace /> },
];
