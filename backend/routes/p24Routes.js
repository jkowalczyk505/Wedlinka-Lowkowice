// routes/p24Routes.js
const express = require("express");
const router = express.Router();
const { notify, returnAfterPay } = require("../controllers/p24Controller");

router.post("/notify", notify);
router.get("/return", returnAfterPay);

module.exports = router;
