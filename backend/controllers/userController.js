// controllers/userController.js
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const db = require("../config/db");
const {
  sendEmailChangedOldEmail,
  sendEmailChangedNewEmail,
  sendAccountDeletedEmail,
} = require("../services/emailService");

const {
  COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  COOKIE_SECURE,
  COOKIE_SAMESITE,
  REFRESH_COOKIE_SECURE,
  REFRESH_COOKIE_SAMESITE,
} = process.env;

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

exports.updateAddress = async (req, res, next) => {
  try {
    const { street, apartmentNumber, postalCode, city } = req.body;

    if (!street || !postalCode || !city) {
      return res.status(400).json({ error: "Brak wymaganych pól adresu" });
    }

    await User.updateAddress(req.user.id, {
      street,
      apartmentNumber,
      postalCode,
      city,
    });

    res.json({ message: "Adres zaktualizowany" });
  } catch (err) {
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

    const existing = await User.existsAnyEmail(newEmail);
    if (existing) {
      return res.status(409).json({ error: "Ten e-mail jest już zajęty" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return res.status(400).json({ error: "Nieprawidłowy adres e-mail" });
    }

    const oldEmail = user.email;

    await User.updateEmail(req.user.id, newEmail);

    // osobne maile
    await sendEmailChangedOldEmail(oldEmail, newEmail);
    await sendEmailChangedNewEmail(newEmail);

    res.json({ message: "E-mail zmieniony" });
  } catch (err) {
    next(err);
  }
};

exports.deleteMe = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });

    await db.query(`DELETE FROM cart_items WHERE user_id = ?`, [userId]);
    await User.markAsDeleted(userId);

    await sendAccountDeletedEmail(user.email);

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: COOKIE_SECURE === "true",
      sameSite: COOKIE_SAMESITE,
    });
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: REFRESH_COOKIE_SECURE === "true",
      sameSite: REFRESH_COOKIE_SAMESITE,
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
