// app.js
const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("./config/db");
const app = express();

app.use(cookieParser());
app.use(express.json());

// podpinamy pulę połączeń jako req.db
app.use((req, res, next) => {
  req.db = db;
  next();
});

// trasy autoryzacji
app.use("/api/auth", require("./routes/authRoutes"));
// trasy usera
app.use("/api/users", require("./routes/userRoutes"));

// globalny error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

module.exports = app;
