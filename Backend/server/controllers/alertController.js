const Alert = require("../models/Alert");
const { detectAnomaly } = require("../utils/alertEngine");

// 🔍 Run intelligent alert detection
exports.runAlertCheck = async (req, res) => {
  try {
    const { todayEnergy, last7DaysEnergy, weatherCondition } = req.body;

    if (
      typeof todayEnergy !== "number" ||
      !Array.isArray(last7DaysEnergy) ||
      last7DaysEnergy.length === 0
    ) {
      return res.status(400).json({ message: "Invalid energy data" });
    }

    const detectedAlerts = detectAnomaly({
      todayEnergy,
      last7DaysEnergy,
      weatherCondition,
    });

    const savedAlerts = [];

    for (const alert of detectedAlerts) {
      const newAlert = await Alert.create({
        userId: req.user.id,
        message: alert.message,
        type:
          alert.severity === "high"
            ? "Critical"
            : alert.severity === "medium"
            ? "Warning"
            : "Info",
      });
      savedAlerts.push(newAlert);
    }

    res.json({
      message: "Alert analysis completed",
      alerts: savedAlerts,
    });
  } catch (error) {
    console.error("Alert Error:", error);
    res.status(500).json({ message: "Alert detection failed" });
  }
};

// 📥 Get all alerts for user
exports.getUserAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to load alerts" });
  }
};

// ✅ Mark alert as read
exports.markAlertRead = async (req, res) => {
  try {
    await Alert.findByIdAndUpdate(req.params.id, {
      isRead: true,
    });

    res.json({ message: "Alert marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update alert" });
  }
};
