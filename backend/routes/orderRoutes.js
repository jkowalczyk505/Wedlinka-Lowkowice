// routes/orderRoutes.js
const router = require("express").Router();
const {
  createOrder,
  getOrderSummary,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  updatePaymentStatus,
  getLatestOrders,
} = require("../controllers/orderController");
const {
  protect,
  optionalAuth,
  adminOnly,
} = require("../middleware/authMiddleware");

// — Klient —
router.post("/", optionalAuth, createOrder);
router.get("/summary/:orderNumber", getOrderSummary);
router.get(
  "/latest", // /api/orders/latest?limit=2
  protect, // musi być zalogowany
  getLatestOrders
);

// — Admin (chronione) —
router.get("/", protect, adminOnly, getAllOrders);
router.get("/:id", protect, adminOnly, getOrderDetails);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.put("/:id/payment-status", protect, adminOnly, updatePaymentStatus);

module.exports = router;
