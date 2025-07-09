// src/utils/product.js

/**
 * Mapa slug → { title, apiCategory }
 * Klucze bez myślników można zapisać bez cudzysłowu,
 * te z myślnikiem muszą być w cudzysłowach.
 */
const SLUG_MAP = {
  wedliny:            { title: "Wędliny",          apiCategory: "wędliny" },
  kielbasy:           { title: "Kiełbasy",         apiCategory: "kiełbasy" },
  "wyroby-podrobowe": { title: "Wyroby podrobowe",  apiCategory: "wyroby podrobowe" },
  "nasze-paczki":     { title: "Nasze paczki",     apiCategory: "paczki" },
};

/**
 * Zwraca metadane dla danej ścieżki (slug) lub null,
 * jeśli slug nieznany.
 */
export function getCategoryMeta(slug) {
  return SLUG_MAP[slug] || null;
}

/**
 * Formatowanie ceny brutto (z VAT-em) na polski format.
 * priceNet, vatRate to stringi typu "22.50", "0.05"
 * Zwraca np. "23,62"
 */
export function formatGrossPrice(priceNet, vatRate) {
  const net = parseFloat(priceNet) || 0;
  const vat = parseFloat(vatRate) || 0;
  const brutto = net * (1 + vat);
  return brutto.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formatowanie ilości. Jeśli liczba jest całkowita,
 * pokazuje bez miejsc po przecinku, w przeciwnym razie
 * dwie cyfry po przecinku:
 *   2    → "2"
 *   2.5  → "2,50"
 */
export function formatQuantity(quantity) {
  const q = parseFloat(quantity) || 0;
  if (Number.isInteger(q)) {
    return String(q);
  }
  return q.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
