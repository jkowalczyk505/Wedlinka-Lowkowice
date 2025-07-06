// src/components/auth/ProtectedRoute.jsx
import { useAuth } from "./AuthContext";
import Spinner from "../common/Spinner";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner fullscreen />;

  return user ? (
    children
  ) : (
    <Navigate to="/logowanie" replace state={{ from: location }} />
  );
}

export default ProtectedRoute;
