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

// Bezpieczeństwo: tylko nazwa pliku (bez ścieżek)
const safeBase = (s = "") => path.basename(String(s));

router.get("/thumb/:file", async (req, res) => {
  try {
    const file = safeBase(req.params.file);
    const src = path.join(process.cwd(), "uploads", "products", file);

    // sprawdź czy istnieje
    await fs.access(src);

    // render miniatury 60x60 jako PNG
    const buf = await sharp(src)
      .resize(60, 60, { fit: "cover" })
      .png({ quality: 80 })
      .toBuffer();

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return res.end(buf);
  } catch (e) {
    // fallback: 1x1 PNG
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=600");
    return res.end(BLANK_PNG);
  }
});

module.exports = router;
