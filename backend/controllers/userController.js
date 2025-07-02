// controllers/userController.js
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

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

exports.getPublicUser = async (req, res, next) => {
  try {
    const user = await User.findPublicById(req.params.id);
    if (!user)
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, surname, phone } = req.body;

    if (!name && !surname && !phone) {
      return res.status(400).json({ error: "Brak danych do aktualizacji" });
    }

    await User.updateById(req.user.id, { name, surname, phone });
    res.json({ message: "Dane zaktualizowane" });
  } catch (err) {
    console.error("updateMe error:", err);
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByIdWithPassword(req.user.id);
    const match = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Błędne stare hasło" });

    const hash = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(req.user.id, hash);

    res.json({ message: "Hasło zmienione" });
  } catch (err) {
    next(err);
  }
};

exports.changeEmail = async (req, res, next) => {
  try {
    const { newEmail, password } = req.body;
    const user = await User.findByIdWithPassword(req.user.id);
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Nieprawidłowe hasło" });

    const existing = await User.findByEmail(newEmail);
    if (existing) {
      return res.status(409).json({ error: "Ten e-mail jest już zajęty" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return res.status(400).json({ error: "Nieprawidłowy adres e-mail" });
    }

    await User.updateEmail(req.user.id, newEmail);
    res.json({ message: "E-mail zmieniony" });
  } catch (err) {
    next(err);
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    await User.deleteById(req.user.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
