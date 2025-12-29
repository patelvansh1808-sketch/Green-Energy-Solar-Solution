const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  runAlertCheck,
  getUserAlerts,
} = require("../controllers/alertController");

router.post("/check", auth, runAlertCheck);
router.get("/", auth, getUserAlerts);

module.exports = router;
