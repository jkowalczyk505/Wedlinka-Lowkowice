// src/utils/paymentStatus.js

// Lista wszystkich kluczy statusów płatności
export const PAYMENT_STATUS_KEYS = ["pending", "ok", "failed"];

// Tłumaczenia statusów płatności na polski
const PAYMENT_STATUS_PL = {
  pending: "Oczekuje na płatność",
  ok: "Opłacone",
  failed: "Nieudane",
};

export function paymentStatusToPL(key) {
  return PAYMENT_STATUS_PL[key] ?? key;
}
