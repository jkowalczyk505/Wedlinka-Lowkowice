// routes/authRoutes.js
const router = require("express").Router();
const {
  register,
  login,
  refresh,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { getMe } = require("../controllers/userController");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", protect, logout);

// opcjonalnie, endpoint /auth/me
router.get("/me", protect, getMe);

module.exports = router;
