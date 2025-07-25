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
  getOneForUser,
} = require("../controllers/orderController");
const {
  protect,
  optionalAuth,
  adminOnly,
} = require("../middleware/authMiddleware");

// — Klient — //
router.post("/", optionalAuth, createOrder);
router.get("/summary/:orderNumber", getOrderSummary);
router.get("/latest", protect, getLatestOrders);
router.get("/:id", protect, getOneForUser);

// — Admin — //
router.get("/", protect, adminOnly, getAllOrders);
router.get("/admin/:id", protect, adminOnly, getOrderDetails);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.put("/:id/payment-status", protect, adminOnly, updatePaymentStatus);

module.exports = router;
