import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./components/auth/AuthContext";
import { CartProvider } from "./components/cart/CartContext";
import { AlertProvider } from "./components/common/alert/AlertContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AlertProvider>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </AlertProvider>
  </React.StrictMode>
);
