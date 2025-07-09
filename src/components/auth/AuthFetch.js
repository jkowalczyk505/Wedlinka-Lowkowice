const API_URL = process.env.REACT_APP_API_URL;

export async function AuthFetch(url, options = {}, setUser = null) {
  let res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (res.status === 401) {
    const refresh = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refresh.ok) {
      res = await fetch(url, {
        ...options,
        credentials: "include",
      });
    } else {
      res.status = 498;
      if (setUser) setUser(null); // <–– wyczyść usera jeśli przekazany
    }
  }

  return res;
}
