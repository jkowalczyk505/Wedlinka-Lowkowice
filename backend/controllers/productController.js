const ProductModel = require("../models/productModel");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "..", "uploads", "products");

exports.getAllProducts = async (req, res) => {
  const products = await ProductModel.findAll();
  res.json(products);
};

exports.getProductById = async (req, res) => {
  const product = await ProductModel.findById(req.params.id);
  if (!product)
    return res.status(404).json({ error: "Nie znaleziono produktu" });
  res.json(product);
};

exports.createProduct = async (req, res) => {
  try {
    const product = await ProductModel.create({ ...req.body, image: null });

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const finalFileName = `${product.id}${ext}`;
      const tempPath = path.join(uploadDir, req.file.filename);
      const finalPath = path.join(uploadDir, finalFileName);

      fs.renameSync(tempPath, finalPath);
      await ProductModel.updateById(product.id, { image: finalFileName });
      product.image = finalFileName;
    }

    res.status(201).json(product);
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);

    if (req.file) {
      const tempPath = path.join(uploadDir, req.file.filename);
      if (fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch (e) {
          console.warn("Nie udało się usunąć pliku tymczasowego:", e.message);
        }
      }
    }

    res.status(500).json({ error: "Błąd tworzenia produktu" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await ProductModel.findById(id);
    if (!existing)
      return res.status(404).json({ error: "Nie znaleziono produktu" });

    let image = existing.image;

    if (req.file) {
      // usuń stare zdjęcie jeśli istnieje
      if (image) {
        const oldPath = path.join(uploadDir, image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const ext = path.extname(req.file.originalname);
      const newFileName = `${id}${ext}`;
      const tempPath = path.join(uploadDir, req.file.filename);
      const finalPath = path.join(uploadDir, newFileName);

      fs.renameSync(tempPath, finalPath);
      image = newFileName;
    }

    await ProductModel.updateById(id, { ...req.body, image });
    res.json({ message: "Produkt zaktualizowany" });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ error: "Błąd edycji produktu" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product)
      return res.status(404).json({ error: "Nie znaleziono produktu" });

    // NIE USUWAMY ZDJĘCIA Z BACKENDU
    // if (product.image) {
    //   const imgPath = path.join(uploadDir, product.image);
    //   if (fs.existsSync(imgPath)) {
    //     fs.unlinkSync(imgPath);
    //   }
    // }

    await ProductModel.softDeleteById(req.params.id);
    res.json({ message: "Produkt usunięty (logicznie)" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ error: "Błąd podczas usuwania produktu" });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    await ProductModel.updateAvailability(req.params.id, isAvailable);
    res.json({ message: "Dostępność zaktualizowana" });
  } catch (err) {
    res.status(500).json({ error: "Błąd aktualizacji dostępności" });
  }
};
