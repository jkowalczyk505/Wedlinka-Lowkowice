// src/routes/reviewRoutes.js
const express = require("express");
const {
  getReviewsForProduct,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// pobierz wszystkie opinie dla danego produktu
router.get("/product/:productId", getReviewsForProduct);

// dodaj nową opinię (tylko zalogowani)
router.post("/", protect, createReview);

// edytuj własną opinię
router.put("/:id", protect, updateReview);

// usuń swoją opinię (lub admin)
router.delete("/:id", protect, deleteReview);

module.exports = router;
