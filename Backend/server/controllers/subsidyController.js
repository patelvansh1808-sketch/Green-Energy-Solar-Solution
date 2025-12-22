const Subsidy = require("../server/config/models/Subsidy");

exports.checkSubsidy = async (req, res) => {
  const subsidy = await Subsidy.findOne({ state: req.body.state });

  if (!subsidy) {
    return res.status(404).json({ message: "No subsidy available" });
  }

  res.json(subsidy);
};
