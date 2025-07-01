// controllers/userController.js
const User = require("../models/userModel");

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};
