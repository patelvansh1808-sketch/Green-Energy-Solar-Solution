const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    type: {
      type: String,
      enum: ["ENERGY_DROP", "UNDERPERFORMANCE", "WEATHER_WARNING", "MAINTENANCE", "SYSTEM_ERROR", "INVERTER_OFFLINE"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: Date,
    relatedEnergyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Energy",
    },
  },
  { timestamps: true }
);

// Index for fast queries
alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ userId: 1, isResolved: 1 });

module.exports = mongoose.model("Alert", alertSchema);

/**
 * Intelligent anomaly detection logic
 */
exports.detectAnomaly = ({
  todayEnergy,
  last7DaysEnergy,
  weatherCondition,
}) => {
  const avg7Days =
    last7DaysEnergy.reduce((a, b) => a + b, 0) /
    last7DaysEnergy.length;

  const alerts = [];

  // 🔴 Sudden drop detection
  if (todayEnergy < avg7Days * 0.75) {
    alerts.push({
      type: "ENERGY_DROP",
      message: "Sudden drop in solar energy detected",
      severity: "high",
    });
  }

  // 🟡 Underperformance
  if (todayEnergy < avg7Days * 0.9) {
    alerts.push({
      type: "UNDERPERFORMANCE",
      message: "Solar system underperforming",
      severity: "medium",
    });
  }

  // 🌧 Weather based warning
  if (weatherCondition === "cloudy" || weatherCondition === "rainy") {
    alerts.push({
      type: "WEATHER_WARNING",
      message: "Low energy due to weather conditions",
      severity: "low",
    });
  }

  return alerts;
};
