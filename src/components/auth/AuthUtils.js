export async function logout(setUser) {
  try {
    await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (e) {
    console.warn("Nie udało się wylogować", e);
  }

  if (setUser) setUser(null);
  localStorage.removeItem("cart");
  window.location.href = "/";
}

const authContextRef = { current: null };

export function setAuthContext(context) {
  authContextRef.current = context;
}

export function getAuthContext() {
  return authContextRef.current;
}
