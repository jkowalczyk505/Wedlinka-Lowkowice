// app.js
const express = require("express");
const db = require("./config/db"); // jedna instancja puli
const app = express();

app.use(express.json());

// Podpinamy pulę pod req.db, dostępna we wszystkich handlerach
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Tu będą Twoje trasy, np.:
// app.use('/products', require('./routes/productRoutes'));
// app.use('/orders',   require('./routes/orderRoutes'));

// Globalny error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

module.exports = app;
