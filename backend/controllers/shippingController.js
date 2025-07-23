const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../config/shippingMethods.js");

exports.getShippingConfig = (req, res) => {
  try {
    // 🔁 wymuś wczytanie aktualnej wersji
    delete require.cache[require.resolve("../config/shippingMethods")];
    const shippingConfig = require("../config/shippingMethods");
    res.json(shippingConfig);
  } catch (err) {
    console.error("Błąd odczytu konfiguracji:", err);
    res.status(500).json({ error: "Błąd odczytu konfiguracji wysyłek" });
  }
};

exports.updateShippingConfig = (req, res) => {
  const { methods, freeShippingThreshold } = req.body;

  if (!Array.isArray(methods)) {
    return res.status(400).json({ error: "Nieprawidłowy format metod" });
  }

  const sanitized = methods.map((m) => ({
    id: String(m.id),
    label: String(m.label),
    price: Number(m.price),
    cod: m.id === "courier" ? !!m.cod : false, // ❗ tylko dla kuriera
    codFee: Number(m.codFee || 0),
  }));

  const newConfig = {
    methods: sanitized,
    freeShippingThreshold: Number(freeShippingThreshold),
  };

  const fileContent = `module.exports = ${JSON.stringify(
    newConfig,
    null,
    2
  )};\n`;

  fs.writeFile(configPath, fileContent, (err) => {
    if (err) {
      console.error("Błąd zapisu:", err);
      return res
        .status(500)
        .json({ error: "Błąd zapisu pliku konfiguracyjnego" });
    }

    res.json({ message: "Zapisano pomyślnie" });
  });
};
