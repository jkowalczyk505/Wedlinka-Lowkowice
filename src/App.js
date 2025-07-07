import React from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import CookieConsentBanner from "./components/common/CookieConsentBanner";
import { useAuth } from "./components/auth/AuthContext";
import Spinner from "./components/common/Spinner";
import "./styles/App.scss";
import routes from "./routes";

function AppRoutes() {
  return useRoutes(routes);
}

export default function App() {
  const { logoutInProgress } = useAuth(); // ⬅️ dodaj to

  if (logoutInProgress) {
    return <Spinner fullscreen />; // ⬅️ zakrywa wszystko globalnie
  }

  return (
    <BrowserRouter>
      <Header />
      <AppRoutes />
      <Footer />
      <CookieConsentBanner />
    </BrowserRouter>
  );
}
