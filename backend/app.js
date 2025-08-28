const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const db = require("./config/db");
const path = require("path");
const cronRoutes = require("./routes/cron.routes.js");

const app = express();
app.set("trust proxy", 1);

// 1) Security
app.disable("x-powered-by");
app.use(helmet());

// 2) CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://wedlinka.hosting24.pl",
  "https://wedlinkalowkowice.pl",
];
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(new Error("Not allowed by CORS")),
    credentials: true,
    exposedHeaders: ["X-Cart-Removed"],
  })
);

// 3) Parsers (KOLEJNOŚĆ WAŻNA)
app.use(cookieParser());
app.use(express.urlencoded({ extended: false })); // <— DODANE dla P24 (form-data)
app.use(express.json());

// 4) DB in req
app.use((req, res, next) => {
  req.db = db;
  next();
});

// 5) Rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Za dużo prób. Spróbuj ponownie za chwilę." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

// 6) API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/shipping", require("./routes/shippingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
// webhook P24 (urlStatus)
app.use("/api/p24", require("./routes/p24Routes"));
// cron
app.use("/api/cron", cronRoutes);
// faktury
const invoiceRoutes = require("./routes/invoiceRoutes");
app.use("/api/invoices", invoiceRoutes);

// zmiana webp na png
app.use("/api/email", require("./routes/emailAssets"));

// 7) Static uploads
app.use(
  "/api/uploads/products",
  express.static(path.join(__dirname, "uploads", "products"))
);

// 8) Errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

module.exports = app;
