// app.js
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const db = require("./config/db");
const path = require("path");

const app = express();

/** Jeśli siedzisz za proxy/load balancerem (hosting), to włącz to,
 *  żeby limiter poprawnie widział IP klienta. */
app.set("trust proxy", 1);

/** 1) HELMET – nagłówki bezpieczeństwa + ukrycie Express */
app.disable("x-powered-by"); // ukryj X-Powered-By
app.use(helmet()); // domyślny zestaw nagłówków

/** 2) CORS – tylko zaufane domeny */
const allowedOrigins = [
  "http://localhost:3000",
  "https://wedlinka.hosting24.pl",
  "https://wedlinkalowkowice.pl",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    exposedHeaders: ["X-Cart-Removed"],
  })
);

/** Parsowanie ciastek i JSON-a */
app.use(cookieParser());
app.use(express.json());

/** Wstrzyknięcie DB do req */
app.use((req, res, next) => {
  req.db = db;
  next();
});

/** 3) RATE LIMIT – globalny dla całego API */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 1000, // 1000 zapytań / IP / okno
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

/** Dodatkowo: ostrzejszy limiter na logowanie/rejestrację */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 20, // 20 prób / IP
  message: { error: "Za dużo prób. Spróbuj ponownie za chwilę." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

/** Trasy API */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/shipping", require("./routes/shippingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));

/** Pliki statyczne ze zdjęciami produktów */
app.use(
  "/api/uploads/products",
  express.static(path.join(__dirname, "uploads", "products"))
);

/** Obsługa błędów */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

module.exports = app;
