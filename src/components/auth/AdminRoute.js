// auth/AdminRoute.jsx
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // lub <Loader />

  if (!user) return <Navigate to="/logowanie" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}

export default AdminRoute;
