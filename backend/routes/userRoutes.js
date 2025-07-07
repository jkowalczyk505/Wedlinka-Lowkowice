const router = require("express").Router();
const {
  getMe,
  getPublicUser,
  updateMe,
  updateAddress,
  changePassword,
  changeEmail,
  deleteMe,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/public/:id", getPublicUser);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/me/address", protect, updateAddress);
router.put("/me/password", protect, changePassword);
router.put("/me/email", protect, changeEmail);
router.delete("/me", protect, deleteMe);

module.exports = router;
