// lista kluczy statusów zamówień
export const ORDER_STATUS_KEYS = [
  "waiting_payment",
  "paid",
  "packed",
  "ready_for_pickup",
  "shipped",
  "delivered",
  "cancelled",
];

// tłumaczenia
const STATUS_PL = {
  waiting_payment: "Oczekuje na płatność",
  paid: "Opłacone",
  packed: "Gotowe do wysyłki",
  ready_for_pickup: "Gotowe do odbioru",
  shipped: "Wysłane",
  delivered: "Odebrane",
  cancelled: "Anulowane",
};

/**
 * Zwraca polską nazwę statusu zamówienia.
 */
export function statusToPL(key) {
  return STATUS_PL[key] ?? key;
}
