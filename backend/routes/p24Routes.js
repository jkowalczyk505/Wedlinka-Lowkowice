// routes/p24Routes.js
const express = require("express");
const router = express.Router();
const { notify } = require("../controllers/p24Controller");

router.post("/notify", notify);

module.exports = router;
