// src/routes/reviewRoutes.js
const express = require("express");
const {
  getReviewsForProduct,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/reviews           → wszystkie opinie (dla admina)
router.get("/", protect, getAllReviews);

// dodaj nową opinię (tylko zalogowani)
router.post("/", protect, createReview);

// moje opinie
router.get("/my", protect, getMyReviews);

// edytuj własną opinię
router.put("/:id", protect, updateReview);

// usuń swoją opinię (lub admin)
router.delete("/:id", protect, deleteReview);

// pobierz wszystkie opinie dla danego produktu
router.get("/product/:productId", getReviewsForProduct);

module.exports = router;
