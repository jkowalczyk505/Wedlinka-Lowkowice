const fs = require("fs");
const path = require("path");
const axios = require("axios");

const hostname = "https://wedlinkalowkowice.pl";

// 🔸 Statyczne strony
const staticRoutes = [
  { path: "/", freq: "monthly", priority: "0.9" },
  { path: "/sklep", freq: "daily", priority: "1" },
  { path: "/nasze-sklepy", freq: "yearly", priority: "0.5" },
  { path: "/kontakt", freq: "yearly", priority: "0.5" },
  { path: "/informacje-o-dostawie", freq: "yearly", priority: "0.4" },
  { path: "/reklamacje", freq: "yearly", priority: "0.3" },
  { path: "/files/Regulamin_sklepu.pdf", freq: "yearly", priority: "0.2" },
  { path: "/files/Polityka_Prywatnosci.pdf", freq: "yearly", priority: "0.2" },
];

const categorySlugs = [
  "wedliny",
  "kielbasy",
  "wyroby-podrobowe",
  "nasze-paczki",
];

// 🔸 Generuj sitemap
async function generateSitemap() {
  try {
    // 🔸 Pobierz produkty
    const response = await axios.get(
      "https://wedlinkalowkowice.pl/api/products"
    );
    const products = response.data;

    // 🔸 Ścieżki kategorii
    const categoryRoutes = categorySlugs.map((slug) => ({
      path: `/sklep/${slug}`,
      freq: "weekly",
      priority: "0.8",
    }));

    // 🔸 Ścieżki produktów
    const productRoutes = products.map((product) => ({
      path: `/sklep/${product.category}/${product.slug}`,
      freq: "weekly",
      priority: "0.7",
    }));

    // 🔸 Wszystkie ścieżki
    const allRoutes = [...staticRoutes, ...categoryRoutes, ...productRoutes];

    // 🔸 XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    ({ path, freq, priority }) => `  <url>
    <loc>${hostname}${path}</loc>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    // 🔸 Zapisz do pliku
    const sitemapPath = path.resolve(__dirname, "public", "sitemap.xml");
    fs.writeFileSync(sitemapPath, xml);

    console.log("✅ sitemap.xml wygenerowany w /public/sitemap.xml");
  } catch (err) {
    console.error("❌ Błąd podczas generowania sitemap:", err.message);
  }
}

generateSitemap();
