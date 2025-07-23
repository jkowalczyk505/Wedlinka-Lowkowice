const express = require("express");
const router = express.Router();
const {
  getShippingConfig,
  updateShippingConfig,
} = require("../controllers/shippingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getShippingConfig);
router.put("/", protect, adminOnly, updateShippingConfig);

module.exports = router;
