exports.getWeatherImpact = (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        message: "Invalid weather data",
      });
    }

    const temperatures = data.map(d => d.temperature);
    const sunlight = data.map(d => d.sunlight);
    const energy = data.map(d => d.energy);

    const avgEnergy =
      energy.reduce((a, b) => a + b, 0) / energy.length;

    const insight =
      avgEnergy > 10
        ? "Higher sunlight and optimal temperature improve energy output"
        : "Weather conditions are negatively affecting energy generation";

    res.status(200).json({
      message: "Weather impact analysis successful",
      temperatures,
      sunlight,
      energy,
      insight,
    });
  } catch (error) {
    console.error("Weather Impact Error:", error);
    res.status(500).json({
      message: "Weather impact analysis failed",
    });
  }
};
