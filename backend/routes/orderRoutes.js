const router = require("express").Router();
const {
  createOrder,
  getOrderSummary,
} = require("../controllers/orderController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// POST /api/orders — złożenie zamówienia (logowanie opcjonalne)
router.post("/", optionalAuth, createOrder);

router.get("/summary/:orderNumber", getOrderSummary);

module.exports = router;
