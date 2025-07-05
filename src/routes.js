import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/AccountPage";

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
  },
];

export default routes;
