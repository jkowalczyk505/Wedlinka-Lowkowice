// auth/ProtectedRoute.jsx
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // lub spinner

  return user ? children : <Navigate to="/logowanie" replace />;
}

export default ProtectedRoute;
