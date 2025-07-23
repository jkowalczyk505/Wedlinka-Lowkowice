// routes/orderRoutes.js
const router = require("express").Router();
const {
  createOrder,
  getOrderSummary,
  getLatestOrders,
} = require("../controllers/orderController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// POST /api/orders — złożenie zamówienia (logowanie opcjonalne)
router.post("/", optionalAuth, createOrder);

router.get("/summary/:orderNumber", getOrderSummary);

router.get(
  "/latest",          // /api/orders/latest?limit=2
  protect,            // musi być zalogowany
  getLatestOrders
);

module.exports = router;
