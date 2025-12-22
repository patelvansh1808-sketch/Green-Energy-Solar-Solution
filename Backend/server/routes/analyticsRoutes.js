const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  dashboardAnalytics,
} = require("../controllers/analyticsController");

router.get("/dashboard", auth, dashboardAnalytics);

module.exports = router;
