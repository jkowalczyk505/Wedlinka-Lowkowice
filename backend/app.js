const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const db = require("./config/db");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // frontend
    credentials: true,
    exposedHeaders: ["X-Cart-Removed"],
  })
);

app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/shipping", require("./routes/shippingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

app.use(
  "/uploads/products",
  express.static(path.join(__dirname, "uploads", "products"))
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

module.exports = app;
