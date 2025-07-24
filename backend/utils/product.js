//utils/product.js
const SLUG_MAP = {
  wedliny: { title: "Wędliny", apiCategory: "wędliny" },
  kielbasy: { title: "Kiełbasy", apiCategory: "kiełbasy" },
  "wyroby-podrobowe": {
    title: "Wyroby podrobowe",
    apiCategory: "wyroby podrobowe",
  },
  "nasze-paczki": { title: "Nasze paczki", apiCategory: "paczki" },
};

function categoryToSlug(apiCategory) {
  for (const [slug, meta] of Object.entries(SLUG_MAP)) {
    if (meta.apiCategory === apiCategory) return slug;
  }
  return apiCategory;
}

function getCategoryMeta(slug) {
  return SLUG_MAP[slug] || null;
}

function formatGrossPrice(priceBrut) {
  const brutto = parseFloat(priceBrut) || 0;
  return brutto.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatQuantity(quantity) {
  const q = parseFloat(quantity) || 0;
  if (Number.isInteger(q)) {
    return String(q);
  }
  return q.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatSlugTitle(slug) {
  if (!slug) return "";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function calculateVatAmount(brutto, vatRate) {
  const net = brutto / (1 + vatRate);
  return brutto - net;
}

function calculateCartVat(items) {
  return items.reduce((sum, { product, quantity }) => {
    const lineBrutto = product.price * quantity;
    return sum + calculateVatAmount(lineBrutto, product.vatRate);
  }, 0);
}

function slugify(str) {
  return str
    .replace(/ł/g, "l")
    .replace(/Ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-\.]/g, "")
    .replace(/-+/g, "-");
}

function generateProductSlug({ name, quantity, unit }) {
  const base = slugify(name);
  if (!quantity) return base;
  const q = String(quantity).replace(",", ".");
  return `${base}-${q}${unit}`;
}

module.exports = {
  categoryToSlug,
  getCategoryMeta,
  formatGrossPrice,
  formatQuantity,
  formatSlugTitle,
  calculateVatAmount,
  calculateCartVat,
  slugify,
  generateProductSlug,
};
