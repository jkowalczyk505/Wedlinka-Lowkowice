// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { COOKIE_NAME, JWT_SECRET } = process.env;

/**
 * Wymaga poprawnego JWT. Zwraca 401 przy braku / błędzie.
 */
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

/**
 * Dostęp tylko dla admina (po wcześniejszym protect / optionalAuth).
 */
exports.adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Brak autoryzacji" });
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Brak dostępu" });
  next();
};

/**
 * NIE wymaga logowania – jeśli JWT jest, wstrzykuje req.user;
 * jeżeli brakuje lub nieprawidłowy, przechodzi dalej jako gość.
 */
exports.optionalAuth = (req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET); // { id, role }
    } catch {
      // zły token? ignorujemy – użytkownik pozostaje anonimowy
    }
  }
  next();
};
