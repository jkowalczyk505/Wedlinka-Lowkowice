import { createContext, useState, useEffect, useContext } from "react";
import Spinner from "../common/Spinner";
import { AuthFetch } from "./AuthFetch";
import { logout as logoutFn, setAuthContext } from "./AuthUtils";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [logoutInProgress, setLogoutInProgress] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    setAuthContext({ setUser });
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await AuthFetch(`${API_URL}/api/users/me`, {
          method: "GET",
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setUser(null); // tu trafi „Session expired” z code 498
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };
    fetchUser();
  }, [API_URL]);

  // 🔐 Blokuj cały interfejs jeśli trwa wylogowanie
  if (logoutInProgress) {
    return <Spinner fullscreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        authChecked,
        logoutInProgress,
        setLogoutInProgress,
        logout: () => logoutFn(setUser),
      }}
    >
      {loading ? <Spinner fullscreen /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
