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
    const { id } = req.params;

    // tylko autor lub admin
    const existing = await ReviewModel.findByUserAndProduct(userId, req.body.productId);
    if (existing?.id !== +id && !req.user.isAdmin) {
      return res.status(403).json({ error: "Brak dostępu do tej opinii" });
    }

    await ReviewModel.deleteById(id);
    res.json({ message: "Opinia usunięta" });
  } catch (err) {
    console.error("DELETE REVIEW ERROR:", err);
    res.status(500).json({ error: "Błąd usuwania opinii" });
  }
};
