const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getWeatherImpact,
} = require("../controllers/weatherImpactController");

router.post("/analyze", auth, getWeatherImpact);

module.exports = router;
