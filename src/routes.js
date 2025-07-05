import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";

import AccountPage from "./pages/account/AccountPage";
import AccountDashboard from "./pages/account/AccountDashboard";
import OrdersPage from "./pages/account/OrdersPage";
import AccountDetails from "./pages/account/AccountDetails";
import AddressForm from "./pages/account/AddressForm";
import ChangePassword from "./pages/account/ChangePassword";
import ReviewList from "./pages/account/ReviewList";

const routes = [
  { path: "/", element: <HomePage /> },
  { path: "/logowanie", element: <AuthPage /> },
  {
    path: "/konto",
    element: (
      <ProtectedRoute>
        <AccountPage />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AccountDashboard /> },
      { path: "zamowienia", element: <OrdersPage /> },
      { path: "dane", element: <AccountDetails /> },
      { path: "adres", element: <AddressForm /> },
      { path: "haslo", element: <ChangePassword /> },
      { path: "opinie", element: <ReviewList /> },
    ],
  },
];

export default routes;
