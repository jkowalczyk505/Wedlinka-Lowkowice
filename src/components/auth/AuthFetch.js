// auth/AuthFetch.js
import { getAuthContext } from "./AuthUtils";
const API_URL = process.env.REACT_APP_API_URL;

export async function AuthFetch(url, options = {}) {
  const { setUser } = getAuthContext() || {};

  const req = () => fetch(url, { ...options, credentials: "include" });

  let res = await req();

  if (res.status === 401) {
    // próbujemy odświeżyć
    const refresh = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refresh.ok) {
      // udało się – ponawiamy oryginalne żądanie
      res = await req();
    } else {
      // refresh nie działa → sesja wygasła
      if (typeof setUser === "function") setUser(null);

      const err = new Error("Session expired");
      err.code = 498; // własny kod, byś mogła go rozróżnić w catch
      throw err; // przerywamy dalszą obsługę
    }
  }

  return res; // normalny Response
}
