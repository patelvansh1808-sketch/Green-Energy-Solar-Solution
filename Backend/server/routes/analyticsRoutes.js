const express = require("express");
const router = express.Router();
const { dashboardAnalytics } = require("../controllers/analyticsController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, dashboardAnalytics);

module.exports = router;