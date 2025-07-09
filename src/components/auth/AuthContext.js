import { createContext, useState, useEffect, useContext } from "react";
import Spinner from "../common/Spinner";
import { AuthFetch } from "./AuthFetch";
import { logout as logoutFn } from "./AuthUtils";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [logoutInProgress, setLogoutInProgress] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let res = await AuthFetch(
          `${API_URL}/api/users/me`,
          { method: "GET" },
          setUser
        );

        if (res.status === 498) {
          setUser(null);
          return;
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
        setAuthChecked(true); // ⬅️ ustawiamy dopiero po zakończeniu
      }
    };

    fetchUser();
  }, [API_URL]);

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
