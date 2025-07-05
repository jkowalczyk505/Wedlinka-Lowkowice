// src/components/auth/ProtectedRoute.jsx
import { useAuth } from "./AuthContext";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  return user ? (
    children
  ) : (
    <Navigate to="/logowanie" replace state={{ from: location }} />
  );
}

export default ProtectedRoute;
