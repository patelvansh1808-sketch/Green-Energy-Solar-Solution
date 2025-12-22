const Energy = require("../server/config/models/Energy");

exports.dashboardAnalytics = async (req, res) => {
  const energy = await Energy.find({ userId: req.user.id });

  const totalUnits = energy.reduce(
    (sum, item) => sum + item.unitsGenerated,
    0
  );

  res.json({
    totalUnits,
    totalRecords: energy.length,
    estimatedSavings: totalUnits * 6, // ₹6/unit example
    co2Saved: totalUnits * 0.82, // kg CO2
  });
};
