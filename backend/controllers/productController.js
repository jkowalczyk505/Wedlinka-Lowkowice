const ProductModel = require("../models/productModel");
const fs = require("fs");
const path = require("path");
const ReviewModel = require("../models/reviewModel");

const uploadDir = path.join(__dirname, "..", "uploads", "products");

exports.getAllProducts = async (req, res) => {
  try {
    const { sort } = req.query;
    const products = await ProductModel.findAllSorted(sort);

    // dokładamy averageRating do każdego produktu
    const withRating = await Promise.all(
      products.map(async (p) => {
        const { avg, total } = await ReviewModel.getStatsByProductId(p.id);
        return {
          ...p,
          averageRating: avg, // np. 4.87
          reviewsCount: total, // np. 35
        };
      })
    );

    res.json(withRating);
  } catch (err) {
    console.error("GET ALL PRODUCTS ERROR:", err);
    res.status(500).json({ error: "Błąd pobierania produktów" });
  }
};

exports.getProductById = async (req, res) => {
  const product = await ProductModel.findById(req.params.id);
  if (!product)
    return res.status(404).json({ error: "Nie znaleziono produktu" });
  res.json(product);
};

exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await ProductModel.findBySlug(slug);
    if (!product) {
      return res.status(404).json({ error: "Nie znaleziono produktu" });
    }
    const { avg, total } = await ReviewModel.getStatsByProductId(product.id);
    product.averageRating = avg;
    product.reviewsCount = total;
    res.json(product);
  } catch (err) {
    console.error("GET PRODUCT BY SLUG ERROR:", err);
    res.status(500).json({ error: "Błąd pobierania produktu po slugu" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { sort } = req.query;

    // pobieramy wszystkie produkty (może być pusta tablica)
    const products = await ProductModel.findByCategorySorted(category, sort);

    // dokładamy oceny – nawet jeśli lista jest pusta, Promise.all([]) zwróci []
    const withRating = await Promise.all(
      products.map(async (p) => {
        const { avg, total } = await ReviewModel.getStatsByProductId(p.id);
        return {
          ...p,
          averageRating: avg,
          reviewsCount: total,
        };
      })
    );

    // zawsze 200 i lista produktów (nawet jeśli [])
    res.json(withRating);
  } catch (err) {
    console.error("GET PRODUCTS BY CATEGORY ERROR:", err);
    res.status(500).json({ error: "Błąd pobierania produktów z kategorii" });
  }
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
