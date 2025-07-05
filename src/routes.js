import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";

const routes = [
  { path: "/", element: <HomePage /> },
  { path: "/logowanie", element: <AuthPage /> },
];

export default routes;
