const ProductModel = require("../models/productModel");
const fs = require("fs");
const path = require("path");

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

    // Jeśli jest zdjęcie – zapisz jako id.ext
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFileName = `${product.id}${ext}`;
      const oldPath = path.join(
        __dirname,
        "..",
        "uploads",
        "products",
        req.file.filename
      );
      const newPath = path.join(
        __dirname,
        "..",
        "uploads",
        "products",
        newFileName
      );

      fs.renameSync(oldPath, newPath);
      await ProductModel.updateById(product.id, { image: newFileName });
      product.image = newFileName;
    }

    res.status(201).json(product);
  } catch (err) {
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

    // Jeśli dodano nowe zdjęcie – nadpisz jako id.ext
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const fileName = `${id}${ext}`;
      const oldPath = path.join(
        __dirname,
        "..",
        "uploads",
        "products",
        req.file.filename
      );
      const newPath = path.join(
        __dirname,
        "..",
        "uploads",
        "products",
        fileName
      );

      fs.renameSync(oldPath, newPath);
      image = fileName;
    }

    const updatedData = {
      ...req.body,
      image,
    };

    await ProductModel.updateById(id, updatedData);
    res.json({ message: "Produkt zaktualizowany" });
  } catch (err) {
    res.status(500).json({ error: "Błąd edycji produktu" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product)
      return res.status(404).json({ error: "Nie znaleziono produktu" });

    if (product.image) {
      fs.unlink(
        path.join(__dirname, "..", "uploads", "products", product.image),
        () => {}
      );
    }

    await ProductModel.softDeleteById(req.params.id);
    res.json({ message: "Produkt usunięty (logicznie)" });
  } catch (err) {
    res.status(500).json({ error: "Błąd podczas usuwania produktu" });
  }
};

exports.updateAvailability = async (req, res) => {
  const { isAvailable } = req.body;
  await ProductModel.updateAvailability(req.params.id, isAvailable);
  res.json({ message: "Dostępność zaktualizowana" });
};
