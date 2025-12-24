const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const { predictPower } = require("../controllers/predictionController");

router.post("/", auth, predictPower);

module.exports = router;
