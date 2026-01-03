const Subsidy = require("../models/Subsidy");
const Customer = require("../models/Customer");

exports.checkSubsidy = async (req, res) => {
  try {
    // Check if customer is active (if authenticated)
    if (req.user) {
      const customer = await Customer.findOne({ userId: req.user.id });
      
      if (customer && customer.status === "Inactive") {
        return res.status(403).json({
          message: "Your account is inactive. Please contact support.",
          error: "Customer account inactive"
        });
      }
    }

    const subsidy = await Subsidy.findOne({ state: req.body.state });

    if (!subsidy) {
      return res.status(404).json({ message: "No subsidy available" });
    }

    res.json(subsidy);
  } catch (error) {
    console.error("CHECK SUBSIDY ERROR:", error);
    res.status(500).json({
      message: "Failed to check subsidy",
      error: error.message
    });
  }
};
