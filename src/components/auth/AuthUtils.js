export function logout() {
  // Możesz dodać czyszczenie localStorage jeśli coś tam masz
  localStorage.removeItem("user"); // opcjonalnie
  window.location.href = "/logowanie"; // ⬅️ wymusza pełne odświeżenie i czysty kontekst
}
