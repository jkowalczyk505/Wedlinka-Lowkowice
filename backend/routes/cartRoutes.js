const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const auth = require("../middleware/auth");

router.use(auth); // zabezpieczenie: tylko zalogowani

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/", cartController.updateCartItem);
router.delete("/:productId", cartController.removeCartItem);
router.delete("/", cartController.clearCart);

module.exports = router;
