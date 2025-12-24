exports.predictPower = async (req, res) => {
  try {
    const { sunlightHours, temperature } = req.body;

    console.log("Prediction input:", req.body); // 🔥 DEBUG

    if (sunlightHours === undefined || temperature === undefined) {
      return res.status(400).json({ message: "Missing inputs" });
    }

    // AI-assisted regression logic
    const predictedKwh =
      sunlightHours * 4.2 + temperature * 0.8;

    res.json({
      predictedKwh: Number(predictedKwh.toFixed(2)),
      message: "Prediction successful",
    });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ message: "Prediction failed" });
  }
};
