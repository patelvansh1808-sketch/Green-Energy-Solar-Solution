exports.predictPower = async (req, res) => {
  const { capacityKW, sunlightHours } = req.body;

  const predictedUnits = capacityKW * sunlightHours * 0.8;

  res.json({
    predictedUnits,
    message: "AI prediction (basic logic)",
  });
};
