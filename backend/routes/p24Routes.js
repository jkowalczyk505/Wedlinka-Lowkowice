// routes/p24Routes.js
const express = require("express");
const router = express.Router();
const {
  notify,
  returnAfterPay,
  cancel,
} = require("../controllers/p24Controller");

router.post("/notify", notify);
router.get("/return", returnAfterPay);
router.post("/cancel", cancel); // P24 może wysłać POST
router.get("/cancel", cancel); // i/lub GET

module.exports = router;
