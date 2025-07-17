// src/utils/product.js

/**
 * Mapa slug → { title, apiCategory }
 * Klucze bez myślników można zapisać bez cudzysłowu,
 * te z myślnikiem muszą być w cudzysłowach.
 */
const SLUG_MAP = {
  wedliny: { title: "Wędliny", apiCategory: "wędliny" },
  kielbasy: { title: "Kiełbasy", apiCategory: "kiełbasy" },
  "wyroby-podrobowe": {
    title: "Wyroby podrobowe",
    apiCategory: "wyroby podrobowe",
  },
  "nasze-paczki": { title: "Nasze paczki", apiCategory: "paczki" },
};

/**
 * Zamienia api-kategorię z bazy (np. "wędliny") na slug z URL-a ("wedliny").
 * Gdy nie znajdzie – zwraca niezmieniony parametr.
 */
export function categoryToSlug(apiCategory) {
  for (const [slug, meta] of Object.entries(SLUG_MAP)) {
    if (meta.apiCategory === apiCategory) return slug;
  }
  return apiCategory;
}

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
export function formatGrossPrice(priceBrut) {
  const brutto = parseFloat(priceBrut) || 0;
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

export function formatSlugTitle(slug) {
  if (!slug) return "";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Oblicza kwotę VAT od ceny brutto.
 * @param {number} brutto – cena brutto (z VAT)
 * @param {number} vatRate – stawka VAT, np. 0.05
 * @returns {number} – wartość VAT
 */
export function calculateVatAmount(brutto, vatRate) {
  const net = brutto / (1 + vatRate);
  return brutto - net;
}

/**
 * Oblicza sumaryczną kwotę VAT dla tablicy pozycji koszyka.
 * @param {Array<{ product: { price: number, vatRate: number }, quantity: number }>} items
 * @returns {number}
 */
export function calculateCartVat(items) {
  return items.reduce((sum, { product, quantity }) => {
    const lineBrutto = product.price * quantity;
    return sum + calculateVatAmount(lineBrutto, product.vatRate);
  }, 0);
}

export function slugify(str) {
  return str
    .replace(/ł/g, "l")
    .replace(/Ł/g, "l")          // małe i wielkie ł
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-\.]/g, "")
    .replace(/-+/g, "-");
}

/**
 * Generuje slug z nazwy + ilości + jednostki, np. "kielbasa-slaska-0.2kg"
 */
export function generateProductSlug({ name, quantity, unit }) {
  const base = slugify(name);
  if (!quantity) return base;
  // wymuś polską kropkę w systemie: liczba z kropką
  const q = String(quantity).replace(",", ".");
  return `${base}-${q}${unit}`;
}