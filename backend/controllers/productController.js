const ProductModel = require("../models/productModel");
const fs = require("fs");
const path = require("path");
const ReviewModel = require("../models/reviewModel");
const { generateProductSlug } = require("../../src/utils/product"); // dopisz na górze

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
    // jeśli nie przyszło slug albo przyszło puste → wygeneruj
    if (!req.body.slug) {
      req.body.slug = generateProductSlug({
        name: req.body.name,
        quantity: req.body.quantity,
        unit: req.body.unit,
      });
    }
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
    const id       = req.params.id;
    const existing = await ProductModel.findById(id);
    if (!existing) return res.status(404).json({ error: "Nie znaleziono produktu" });

    // jeżeli użytkownik nie nadpisał slug i masz nowe name/qty/unit → przelicz
    if (!req.body.slug && (req.body.name || req.body.quantity || req.body.unit)) {
      const name     = req.body.name     ?? existing.name;
      const quantity = req.body.quantity ?? existing.quantity;
      const unit     = req.body.unit     ?? existing.unit;
      req.body.slug = generateProductSlug({ name, quantity, unit });
    }

    /* ------------------ filtrujemy BODY -------------------- */
   const allowed = [
     "name","category","slug","description","ingredients","allergens",
     "unit","quantity","price_brut","vat_rate","is_available"
   ];
   const cleanBody = {};
   allowed.forEach(k => {
     if (req.body[k] !== undefined) cleanBody[k] = req.body[k];
   });

   // convert numeryczne stringi -> liczby
   ["quantity","price_brut","vat_rate"].forEach(k=>{
     if (cleanBody[k] !== undefined) cleanBody[k] = parseFloat(cleanBody[k]);
   });
   if (cleanBody.is_available !== undefined)
     cleanBody.is_available = Number(cleanBody.is_available) ? 1 : 0;
    /* -------------------------------------------------------- */


    let image = existing.image;

    if (req.body.removeImage === "1" && !req.file) {
      // użytkownik kliknął X i NIE wgrał nowego pliku
      if (image) {
        const oldPath = path.join(uploadDir, image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image = null;                    // zapisz NULL w bazie
    }

    if (req.file) {
      // usuń stare zdjęcie jeśli istnieje
      if (image) {
        const oldPath = path.join(uploadDir, image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const ext = path.extname(req.file.originalname);
      const newFileName = `${id}-${Date.now()}${ext}`; // gwarancja unikalnej nazwy
      const tempPath = path.join(uploadDir, req.file.filename);
      const finalPath = path.join(uploadDir, newFileName);

      fs.renameSync(tempPath, finalPath);
      image = newFileName;
    }

    await ProductModel.updateById(id, { ...cleanBody, image });
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
