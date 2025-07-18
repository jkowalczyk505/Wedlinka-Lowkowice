const router = require("express").Router();
const { createOrder } = require("../controllers/orderController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// POST /api/orders — złożenie zamówienia (logowanie opcjonalne)
router.post("/", optionalAuth, createOrder);

module.exports = router;
