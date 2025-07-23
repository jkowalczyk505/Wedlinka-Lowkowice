// lista kluczy statusów zamówień
export const ORDER_STATUS_KEYS = [
  "new",
  "waiting_payment",
  "paid",
  "packed",
  "shipped",
  "delivered",
  "canceled",
  "failed",
];

// tłumaczenia
const STATUS_PL = {
  new: "Nowe",
  waiting_payment: "Oczekuje na płatność",
  paid: "Opłacone",
  packed: "Gotowe do wysyłki",
  shipped: "Wysłane",
  delivered: "Dostarczone",
  canceled: "Anulowane",
  failed: "Nieudane",
};

/**
 * Zwraca polską nazwę statusu zamówienia.
 */
export function statusToPL(key) {
  return STATUS_PL[key] ?? key;
}
