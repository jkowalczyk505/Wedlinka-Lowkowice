// lista kluczy, jeśli gdzieś przyda się <select> itp.
export const SHIPPING_METHOD_KEYS = [
  "pickup",
  "inpost",
  "courier", // ogólny
  "courier_prepaid", // klon tworzony w ShippingMethods.jsx
  "courier_cod", // klon tworzony w ShippingMethods.jsx
];

// bazowe etykiety
const BASE_PL = {
  pickup: "Odbiór osobisty",
  inpost: "Paczkomaty InPost 24/7",
  courier: "Kurier",
};

/**
 * Zamienia klucz (np. "courier_cod") na polską etykietę.
 * Jeśli nie znane – zwraca oryginał.
 */
export function shippingToPL(key) {
  if (BASE_PL[key]) return BASE_PL[key]; // pickup / inpost / courier

  // „klony” kuriera tworzone w ShippingMethods.jsx
  if (key === "courier_prepaid") return "Kurier (przedpłata)";
  if (key === "courier_cod") return "Kurier (za pobraniem)";

  return key; // fallback
}
