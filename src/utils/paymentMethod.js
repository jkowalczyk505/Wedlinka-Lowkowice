export const PAYMENT_METHOD_KEYS = ["przelewy24", "bank_transfer", "cod"];

const METHOD_PL = {
  przelewy24: "Płatność online (Przelewy24)",
  bank_transfer: "Przelew tradycyjny",
  cod: "Przy odbiorze",
};

export function paymentMethodToPL(key) {
  return METHOD_PL[key] ?? key;
}
