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
