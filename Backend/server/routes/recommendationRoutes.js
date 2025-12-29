const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getSmartRecommendations,
} = require("../controllers/recommendationController");

router.get("/smart", auth, getSmartRecommendations);

module.exports = router;
