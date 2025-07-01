// routes/userRoutes.js
const router = require("express").Router();
const { getMe } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// GET /users/me  – zwraca profil zalogowanego
router.get("/me", protect, getMe);

module.exports = router;
