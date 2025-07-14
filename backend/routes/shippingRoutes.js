// routes/shippingRoutes.js
const express = require("express");
const router = express.Router();
const shippingConfig = require("../config/shippingMethods");

router.get("/", (req, res) => {
  res.json(shippingConfig);
});

module.exports = router;
