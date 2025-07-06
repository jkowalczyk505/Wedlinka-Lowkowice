import { useAuth } from "./AuthContext";
import Spinner from "../common/Spinner";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user, loading, authChecked, logoutInProgress } = useAuth();
  const location = useLocation();

  if (loading || !authChecked) return <Spinner fullscreen />;

  if (!user && logoutInProgress) return <Spinner fullscreen />;

  return user ? (
    children
  ) : (
    <Navigate to="/logowanie" replace state={{ from: location }} />
  );
}

export default ProtectedRoute;
