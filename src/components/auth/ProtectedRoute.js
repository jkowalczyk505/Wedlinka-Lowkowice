// components/auth/ProtectedRoute.jsx
import { useAuth } from "./AuthContext";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Spinner from "../common/Spinner";
import { AuthFetch } from "./AuthFetch";

const API_URL = process.env.REACT_APP_API_URL;

export default function ProtectedRoute({ children }) {
  const { user, loading, authChecked } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function verify() {
      // jeśli nie ma usera lub AuthProvider jeszcze się ładuje, nie pingujemy
      if (!authChecked || !user) return setChecking(false);

      try {
        await AuthFetch(`${API_URL}/api/users/me`, { method: "GET" });
        if (!ignore) setChecking(false); // sesja OK
      } catch {
        if (!ignore) setChecking(false); // AuthFetch wylogował i rzucił err.code=498
      }
    }
    verify();
    return () => (ignore = true);
  }, [user, authChecked]);

  if (loading || checking) return <Spinner fullscreen />;
  if (!user)
    return <Navigate to="/logowanie" replace state={{ from: location }} />;
  return children;
}
