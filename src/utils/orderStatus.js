// nazwa  →  tekst PL
const STATUS_PL = {
  new:             "Nowe",
  waiting_payment: "Oczekuje na płatność",
  paid:            "Opłacone",
  packed:          "Gotowe do wysyłki",
  shipped:         "Wysłane",
  delivered:       "Dostarczone",
  canceled:        "Anulowane",
  failed:          "Nieudane",
};

/**
 * Zwraca polską nazwę statusu zamówienia.
 * Nieznany status → oryginalny tekst.
 */
export function statusToPL(key) {
  return STATUS_PL[key] ?? key;
}