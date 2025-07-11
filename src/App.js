import React from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import CookieConsentBanner from "./components/common/CookieConsentBanner";
import { useAuth } from "./components/auth/AuthContext";
import Spinner from "./components/common/Spinner";
import "./styles/App.scss";
import routes from "./routes";
import ScrollToTop from "./components/common/ScrollToTop";

function AppRoutes() {
  return useRoutes(routes);
}

export default function App() {
  const { logoutInProgress } = useAuth();

  if (logoutInProgress) {
    return <Spinner fullscreen />;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <AppRoutes />
      <Footer />
      <CookieConsentBanner />
    </BrowserRouter>
  );
}
