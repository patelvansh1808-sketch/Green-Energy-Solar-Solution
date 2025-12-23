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
