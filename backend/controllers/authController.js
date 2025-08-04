// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const {
  JWT_SECRET,
  JWT_EXPIRES,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES,
  COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  COOKIE_HTTPONLY,
  COOKIE_SECURE,
  COOKIE_SAMESITE,
  REFRESH_COOKIE_HTTPONLY,
  REFRESH_COOKIE_SECURE,
  REFRESH_COOKIE_SAMESITE,
} = process.env;

exports.register = async (req, res, next) => {
  try {
    const { email, password, name, surname, phone } = req.body;
    if (!email || !password || !name || !surname || !phone) {
      return res.status(400).json({ error: "Wszystkie pola są wymagane" });
    }

    // Sprawdź, czy email był kiedykolwiek użyty (nawet przez konto usunięte)
    const exists = await User.existsAnyEmail(email);
    if (exists) {
      return res.status(409).json({ error: "Ten e-mail jest już zajęty" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash: hash,
      name,
      surname,
      phone,
    });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, remember } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: "Nieprawidłowe dane" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Nieprawidłowe dane" });

    const payload = { id: user.id, role: user.role };
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES,
    });

    const accessMaxAge = remember ? msToNum(JWT_EXPIRES) : 6 * 60 * 60 * 1000; // 6h
    const refreshMaxAge = remember
      ? msToNum(JWT_REFRESH_EXPIRES)
      : 24 * 60 * 60 * 1000; // 1 dzień

    res.cookie(COOKIE_NAME, accessToken, {
      httpOnly: COOKIE_HTTPONLY === "true",
      secure: COOKIE_SECURE === "true",
      sameSite: COOKIE_SAMESITE,
      maxAge: accessMaxAge,
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: REFRESH_COOKIE_HTTPONLY === "true",
      secure: REFRESH_COOKIE_SECURE === "true",
      sameSite: REFRESH_COOKIE_SAMESITE,
      maxAge: refreshMaxAge,
    });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

exports.refresh = (req, res) => {
  try {
    const rt = req.cookies[REFRESH_COOKIE_NAME];
    if (!rt) return res.status(401).json({ error: "Brak refresh tokena" });

    const payload = jwt.verify(rt, JWT_REFRESH_SECRET);
    const newAccess = jwt.sign(
      { id: payload.id, role: payload.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.cookie(COOKIE_NAME, newAccess, {
      httpOnly: COOKIE_HTTPONLY === "true",
      secure: COOKIE_SECURE === "true",
      sameSite: COOKIE_SAMESITE,
      maxAge: msToNum(JWT_EXPIRES),
    });

    res.status(204).end();
  } catch {
    res.status(401).json({ error: "Nieprawidłowy refresh token" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: COOKIE_HTTPONLY === "true",
    secure: COOKIE_SECURE === "true",
    sameSite: COOKIE_SAMESITE,
  });
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: REFRESH_COOKIE_HTTPONLY === "true",
    secure: REFRESH_COOKIE_SECURE === "true",
    sameSite: REFRESH_COOKIE_SAMESITE,
  });
  res.status(204).end();
};

// helper: konwertuje '30m','7d' na ms
function msToNum(str) {
  const num = parseInt(str);
  if (str.endsWith("m")) return num * 60 * 1000;
  if (str.endsWith("h")) return num * 60 * 60 * 1000;
  if (str.endsWith("d")) return num * 24 * 60 * 60 * 1000;
  return num;
}
