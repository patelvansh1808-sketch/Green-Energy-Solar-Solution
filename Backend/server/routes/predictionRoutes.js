const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { predictSolarPower } = require("../controllers/predictionController");

router.post("/", auth, predictSolarPower);

module.exports = router;
