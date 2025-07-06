import { createContext, useState, useEffect, useContext } from "react";
import Spinner from "../common/Spinner"; // Upewnij się, że ścieżka jest poprawna

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let res = await fetch(`${API_URL}/api/users/me`, {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401) {
          // Spróbuj odświeżyć token
          const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });

          if (refreshRes.ok) {
            // Ponownie sprawdź sesję
            res = await fetch(`${API_URL}/api/users/me`, {
              method: "GET",
              credentials: "include",
            });
          }
        }

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [API_URL]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {loading ? <Spinner fullscreen /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
