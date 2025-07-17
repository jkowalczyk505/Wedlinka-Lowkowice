// src/routes/reviewRoutes.js
const express = require("express");
const {
  getReviewsForProduct,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/reviews           → wszystkie opinie (dla admina)
router.get("/", protect, getAllReviews);

// pobierz wszystkie opinie dla danego produktu
router.get("/product/:productId", getReviewsForProduct);

// dodaj nową opinię (tylko zalogowani)
router.post("/", protect, createReview);

// edytuj własną opinię
router.put("/:id", protect, updateReview);

// usuń swoją opinię (lub admin)
router.delete("/:id", protect, deleteReview);

module.exports = router;
