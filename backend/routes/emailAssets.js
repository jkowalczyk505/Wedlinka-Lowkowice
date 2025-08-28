// routes/emailAssets.js
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs/promises");
const sharp = require("sharp");

// 1×1 transparent PNG (fallback)
const BLANK_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y8mC0cAAAAASUVORK5CYII=",
  "base64"
);

// tylko nazwa pliku (bez ścieżek)
const safeBase = (s = "") => path.basename(String(s));

// jeden handler obsłuży /thumb/:file i /thumb-png/:file
router.get(["/thumb/:file", "/thumb-png/:file"], async (req, res) => {
  try {
    const file = safeBase(req.params.file);
    const src = path.join(process.cwd(), "uploads", "products", file);

    await fs.access(src);

    // render miniatury 60x60 jako PNG
    const buf = await sharp(src)
      .resize(60, 60, { fit: "cover" })
      .png({ quality: 80 })
      .toBuffer();

    // ── NAGŁÓWKI WAŻNE DLA KLIENTÓW POCZTOWYCH/CDN ──────────────────────
    res.setHeader("Content-Type", "image/png");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${path.parse(file).name}.png"`
    );
    // unikanie „przepisywania” przez CDN (Cloudflare itp.)
    res.setHeader("Cache-Control", "public, max-age=604800, no-transform"); // 7 dni
    return res.end(buf);
  } catch (e) {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=600, no-transform");
    return res.end(BLANK_PNG);
  }
});

module.exports = router;
