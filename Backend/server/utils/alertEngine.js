exports.generateAlerts = (energyData) => {
  let alerts = [];

  energyData.forEach((entry) => {
    if (entry.unitsGenerated < 2) {
      alerts.push({
        type: "Warning",
        message: "Low solar generation detected today",
      });
    }
  });

  return alerts;
};
