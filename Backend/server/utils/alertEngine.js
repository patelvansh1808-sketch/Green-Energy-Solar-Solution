/**
 * Intelligent anomaly detection logic
 * Rule-based AI
 */
exports.detectAnomaly = ({
  todayEnergy,
  last7DaysEnergy,
  weatherCondition,
}) => {
  const avg7Days =
    last7DaysEnergy.reduce((sum, value) => sum + value, 0) /
    last7DaysEnergy.length;

  const alerts = [];

  // 🔴 CRITICAL: Sudden energy drop (>25%)
  if (todayEnergy < avg7Days * 0.75) {
    alerts.push({
      type: "Critical",
      message: "Sudden drop in solar energy detected",
    });
  }

  // 🟡 WARNING: Underperformance (>10%)
  else if (todayEnergy < avg7Days * 0.9) {
    alerts.push({
      type: "Warning",
      message: "Solar system underperforming",
    });
  }

  // 🔵 INFO: Weather-based warning
  if (
    weatherCondition === "cloudy" ||
    weatherCondition === "rainy"
  ) {
    alerts.push({
      type: "Info",
      message: "Low energy due to weather conditions",
    });
  }

  return alerts;
};
