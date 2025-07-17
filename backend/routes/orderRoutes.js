const router = require("express").Router();
const { createOrder } = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/orders — złożenie zamówienia (wymaga logowania)
router.post("/", protect, createOrder);

module.exports = router;
