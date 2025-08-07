// routes/authRoutes.js
const router = require("express").Router();
const {
  register,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { getMe } = require("../controllers/userController");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", protect, logout);

// 🔐 Authenticated user info
router.get("/me", protect, getMe);

// 🔑 Password reset
router.post("/password-reset/request", requestPasswordReset);
router.post("/password-reset/confirm", resetPassword);

module.exports = router;
