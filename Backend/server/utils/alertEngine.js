exports.detectAnomaly = ({ todayEnergy, last7DaysEnergy, weatherCondition }) => {
  const avg =
    last7DaysEnergy.reduce((a, b) => a + b, 0) /
    last7DaysEnergy.length;

  const alerts = [];

  if (todayEnergy < avg * 0.75) {
    alerts.push({
      message: "Sudden drop in solar energy detected",
      severity: "high",
    });
  }

  if (todayEnergy < avg * 0.9) {
    alerts.push({
      message: "Solar system underperforming",
      severity: "medium",
    });
  }

  if (weatherCondition === "rainy" || weatherCondition === "cloudy") {
    alerts.push({
      message: "Low solar output due to weather conditions",
      severity: "low",
    });
  }

  return alerts;
};
