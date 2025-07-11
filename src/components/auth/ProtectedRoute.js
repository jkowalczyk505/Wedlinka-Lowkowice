import { useAuth } from "./AuthContext";
import Spinner from "../common/Spinner";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user, loading, authChecked, logoutInProgress } = useAuth();
  const location = useLocation();

  if (loading || !authChecked) return <Spinner fullscreen />;

  if (logoutInProgress) return <Spinner fullscreen />;

  if (!user) {
    return <Navigate to="/logowanie" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
