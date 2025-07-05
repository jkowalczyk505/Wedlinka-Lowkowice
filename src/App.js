// src/App.jsx
import React from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import CookieConsentBanner from "./components/common/CookieConsentBanner";
import "./styles/App.scss";
import routes from "./routes";

function AppRoutes() {
  return useRoutes(routes);
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <AppRoutes /> {/* ← tu wpadnie cały layout + children */}
      <Footer />
      <CookieConsentBanner />
    </BrowserRouter>
  );
}
