const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  runAlertCheck,
  getUserAlerts,
  markAlertRead,
} = require("../controllers/alertController");

// 🔍 Run anomaly detection
router.post("/check", auth, runAlertCheck);

// 📥 Get alerts for logged-in user
router.get("/", auth, getUserAlerts);

// ✅ Mark alert as read
router.put("/:id/read", auth, markAlertRead);

module.exports = router;
