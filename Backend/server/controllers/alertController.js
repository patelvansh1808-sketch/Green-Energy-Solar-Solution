const Alert = require("../models/Alert");
const { detectAnomaly } = require("../utils/alertEngine");

/**
 * Run intelligent alert detection
 * POST /api/alerts/check
 */
exports.runAlertCheck = async (req, res) => {
  try {
    const {
      todayEnergy,
      last7DaysEnergy,
      weatherCondition,
    } = req.body;

    // Basic validation
    if (
      typeof todayEnergy !== "number" ||
      !Array.isArray(last7DaysEnergy) ||
      last7DaysEnergy.length === 0
    ) {
      return res.status(400).json({
        message: "Invalid energy data",
      });
    }
    exports.getUserAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json(alerts);
  } catch (error) {
    console.error("Fetch Alerts Error:", error);
    res.status(500).json({
      message: "Failed to fetch alerts",
    });
  }
};

    const detectedAlerts = detectAnomaly({
      todayEnergy,
      last7DaysEnergy,
      weatherCondition,
    });

    // Save alerts in DB
    const savedAlerts = [];
    for (const alert of detectedAlerts) {
      const newAlert = await Alert.create({
        userId: req.user.id,
        message: alert.message,
        type: alert.type,
      });
      savedAlerts.push(newAlert);
    }

    res.status(200).json({
      message: "Alert analysis completed",
      alerts: savedAlerts,
    });
  } catch (error) {
    console.error("Alert Error:", error);
    res.status(500).json({
      message: "Alert detection failed",
    });
  }
};
