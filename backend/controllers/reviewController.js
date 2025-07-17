// src/controllers/reviewController.js
const ReviewModel = require("../models/reviewModel");

exports.getReviewsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await ReviewModel.findAllByProduct(productId);
    res.json(reviews);
  } catch (err) {
    console.error("GET REVIEWS ERROR:", err);
    res.status(500).json({ error: "Błąd pobierania opinii" });
  }
};

/**
 * Pobiera wszystkie opinie (do panelu admina)
 */
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await ReviewModel.findAllWithProduct();
    res.json(reviews);
  } catch (err) {
    console.error("GET ALL REVIEWS ERROR:", err);
    res.status(500).json({ error: "Błąd pobierania wszystkich opinii" });
  }
};

exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    // sprawdź, czy już istnieje opinia tego usera na ten produkt
    const existing = await ReviewModel.findByUserAndProduct(userId, productId);
    if (existing) {
      return res.status(400).json({ error: "Już oceniłeś ten produkt" });
    }

    const newReview = await ReviewModel.create({
      user_id: userId,
      product_id: productId,
      rating,
      comment
    });
    res.status(201).json(newReview);
  } catch (err) {
    console.error("CREATE REVIEW ERROR:", err);
    res.status(500).json({ error: "Błąd tworzenia opinii" });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, comment } = req.body;

    // upewnij się, że to opinia tego usera
    const existing = await ReviewModel.findByUserAndProduct(userId, req.body.productId);
    if (!existing || existing.id !== +id) {
      return res.status(403).json({ error: "Brak dostępu do tej opinii" });
    }

    await ReviewModel.updateById(id, { rating, comment });
    res.json({ message: "Opinia zaktualizowana" });
  } catch (err) {
    console.error("UPDATE REVIEW ERROR:", err);
    res.status(500).json({ error: "Błąd edycji opinii" });
  }
};

 exports.deleteReview = async (req, res) => {
   try {
     const userId = req.user.id;
     const { id }   = req.params;

     // 1) Pobierz opinię z bazy
     const review = await ReviewModel.findById(id);
     if (!review) {
       return res.status(404).json({ error: "Nie znaleziono opinii" });
     }

      if (review.user_id !== userId && req.user.role !== "admin") {
        return res.status(403).json({ error: "Brak dostępu do tej opinii" });
      }

     // 3) Usuń
     await ReviewModel.deleteById(id);
     res.json({ message: "Opinia usunięta" });
   } catch (err) {
     console.error("DELETE REVIEW ERROR:", err);
     res.status(500).json({ error: "Błąd usuwania opinii" });
   }
 };
