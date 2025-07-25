const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  updateAvailability,
  getProductsByCategory,
} = require("../controllers/productController");
const { protect, adminOnly, optionalAuth } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerUpload");

router.get("/slug/:slug", optionalAuth, getProductBySlug);
router.get("/", getAllProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProductById);
router.post("/", protect, adminOnly, upload.single("image"), createProduct);
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.patch("/:id/availability", protect, adminOnly, updateAvailability);

module.exports = router;
