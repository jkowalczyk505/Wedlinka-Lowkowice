const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateAvailability,
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerUpload");

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", protect, adminOnly, upload.single("image"), createProduct);
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.patch("/:id/availability", protect, adminOnly, updateAvailability);

module.exports = router;
