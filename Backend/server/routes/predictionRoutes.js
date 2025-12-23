const express = require("express");
const router = express.Router();
const { predictPower } = require("../controllers/predictionController");

router.post("/", predictPower);

module.exports = router;