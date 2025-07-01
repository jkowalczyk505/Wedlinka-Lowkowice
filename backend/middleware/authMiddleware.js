// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { COOKIE_NAME, JWT_SECRET } = process.env;

exports.protect = (req, res, next) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Brak autoryzacji" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch {
    return res.status(401).json({ error: "Nieprawidłowy token" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Brak autoryzacji" });
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Brak dostępu" });
  next();
};
