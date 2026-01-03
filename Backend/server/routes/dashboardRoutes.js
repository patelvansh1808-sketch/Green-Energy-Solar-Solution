const express = require("express");
const router = express.Router();

const {
  getDashboard,
  getEnergyChart,
  getAlerts,
  resolveAlert,
  getRoiProjection,
  recordEnergy,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");

// Main dashboard data
router.get("/", authMiddleware, getDashboard);

// Energy chart data
router.get("/energy", authMiddleware, getEnergyChart);

// Record energy data
router.post("/energy", authMiddleware, recordEnergy);

// Alerts
router.get("/alerts", authMiddleware, getAlerts);
router.patch("/alerts/:id/resolve", authMiddleware, resolveAlert);

// ROI projection
router.get("/roi", authMiddleware, getRoiProjection);

module.exports = router;
