const Energy = require("../models/Energy");

// ADD ENERGY DATA
exports.addEnergy = async (req, res) => {
  const energy = await Energy.create({
    userId: req.user.id,
    date: new Date(),
    unitsGenerated: req.body.unitsGenerated,
  });
  res.status(201).json(energy);
};

// GET ENERGY DATA
exports.getEnergy = async (req, res) => {
  const data = await Energy.find({ userId: req.user.id });
  res.json(data);
};

// GENERATE SAMPLE DATA FOR TESTING
exports.generateSampleData = async (req, res) => {
  try {
    // Delete existing records for this user
    await Energy.deleteMany({ userId: req.user.id });

    // Generate 90 days of realistic energy data (3 months back)
    const records = [];
    const today = new Date();

    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Realistic daily generation: 8-18 kWh (varies by day, season, weather)
      const baseUnit = 12;
      const variance = Math.sin(i / 30) * 4; // Seasonal variation
      const dailyVariance = (Math.random() - 0.5) * 6; // Random daily fluctuation
      const units = Math.max(5, baseUnit + variance + dailyVariance);

      records.push({
        userId: req.user.id,
        date,
        unitsGenerated: Number(units.toFixed(2)),
      });
    }

    await Energy.insertMany(records);

    res.status(201).json({
      message: "Sample energy data generated successfully",
      recordsCreated: records.length,
      dateRange: `${records[0].date.toISOString().split('T')[0]} to ${records[records.length - 1].date.toISOString().split('T')[0]}`,
    });
  } catch (error) {
    console.error("SAMPLE DATA ERROR:", error.message);
    res.status(500).json({ message: "Sample data generation failed" });
  }
};
