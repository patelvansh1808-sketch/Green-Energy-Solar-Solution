const Energy = require("../models/Energy");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Subsidy = require("../models/Subsidy");

/**
 * Analyze user energy consumption and recommend panel size
 * Rules:
 * - Average daily units * 1.5 = recommended kW capacity
 * - Minimum 1kW, Maximum 20kW
 */
const getPanelRecommendation = async (userId) => {
  const records = await Energy.find({ userId }).sort({ date: -1 }).limit(90);

  if (!records.length) {
    return {
      recommendedCapacity: 3, // Default fallback
      avgDailyUsage: 0,
      reason: "No usage history; recommending standard 3kW residential system.",
    };
  }

  // Calculate average daily generation
  const daily = {};
  records.forEach((r) => {
    const key = r.date.toISOString().split("T")[0];
    daily[key] = (daily[key] || 0) + r.unitsGenerated;
  });

  const avgDaily = Object.values(daily).reduce((a, b) => a + b, 0) / Object.keys(daily).length;

  // Recommend 1.5x of average for peak capacity + buffer
  let recommended = avgDaily * 1.5;
  recommended = Math.max(1, Math.min(20, recommended)); // Clamp between 1-20 kW
  recommended = Math.round(recommended * 10) / 10; // Round to nearest 0.1

  return {
    recommendedCapacity: recommended,
    avgDailyUsage: Number(avgDaily.toFixed(2)),
    reason: `Based on your ${Number(avgDaily.toFixed(2))} kWh/day average, a ${recommended} kW system covers peak demand + 30% buffer.`,
  };
};

/**
 * Compare EMI vs Lump Sum payment
 * Factors: cost, duration, interest rate
 */
const getPaymentRecommendation = (systemCost, availableFunding) => {
  const lumpSumCost = systemCost;
  const emiYears = 7;
  const annualInterestRate = 0.08; // 8% annual
  const monthlyRate = annualInterestRate / 12;
  const numMonths = emiYears * 12;

  // Calculate monthly EMI using standard formula
  const monthlyEmi =
    (systemCost * monthlyRate * Math.pow(1 + monthlyRate, numMonths)) /
    (Math.pow(1 + monthlyRate, numMonths) - 1);

  const totalEmiCost = monthlyEmi * numMonths;
  const totalInterest = totalEmiCost - systemCost;

  // Decision logic
  let recommendation = "EMI";
  let reasoning = "";

  if (availableFunding >= lumpSumCost * 0.8) {
    recommendation = "Lump Sum";
    reasoning = `You have sufficient funds. Lump sum saves ₹${Number(
      totalInterest.toFixed(0)
    )} in interest over ${emiYears} years.`;
  } else if (availableFunding >= lumpSumCost * 0.4) {
    recommendation = "Hybrid (50% Lump Sum + 50% EMI)";
    const easyEmi = (monthlyEmi / 2).toFixed(0);
    reasoning = `Balanced approach: pay ₹${(lumpSumCost * 0.5).toFixed(0)} upfront, ₹${easyEmi}/month EMI.`;
  } else {
    reasoning = `EMI spreads cost: ₹${monthlyEmi.toFixed(0)}/month for ${emiYears} years.`;
  }

  return {
    recommendation,
    monthlyEmi: Number(monthlyEmi.toFixed(0)),
    totalCost: Number(totalEmiCost.toFixed(0)),
    totalInterest: Number(totalInterest.toFixed(0)),
    emiDuration: emiYears,
    reasoning,
  };
};

/**
 * Subsidy eligibility & recommendation
 */
const getSubsidyRecommendation = async (user, systemCapacity) => {
  // Check subsidy rules for user's location/state
  const subsidy = await Subsidy.findOne({ state: user.location || "General" });

  if (!subsidy) {
    return {
      eligible: true,
      estimatedSubsidy: systemCapacity > 5 ? 0 : systemCapacity * 10000, // ₹10k per kW for residential <5kW
      reason: "No specific state rules found; using default subsidy matrix.",
    };
  }

  const systemCost = systemCapacity * 100000; // Assume ₹1L per kW as base cost
  const subsidyByPercentage = (systemCost * subsidy.maxPercentage) / 100;
  const estimatedSubsidy = Math.min(subsidyByPercentage, subsidy.maxAmount);

  return {
    eligible: true,
    state: subsidy.state,
    maxPercentage: subsidy.maxPercentage,
    estimatedSubsidy: Number(estimatedSubsidy.toFixed(0)),
    reason: `Your state provides up to ${subsidy.maxPercentage}% subsidy or ₹${subsidy.maxAmount.toLocaleString(
      "en-IN"
    )}, whichever is lower.`,
  };
};

exports.getSmartRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all recommendations
    const panelRec = await getPanelRecommendation(req.user.id);
    const availableFunding = Number(req.query.funding) || 0; // User provides available budget
    const paymentRec = getPaymentRecommendation(panelRec.recommendedCapacity * 100000, availableFunding);
    const subsidyRec = await getSubsidyRecommendation(user, panelRec.recommendedCapacity);

    // Calculate post-subsidy cost
    const grossCost = panelRec.recommendedCapacity * 100000;
    const netCost = grossCost - subsidyRec.estimatedSubsidy;

    res.json({
      message: "Smart recommendations generated",
      recommendations: {
        panel: {
          ...panelRec,
          estimatedCost: grossCost,
        },
        payment: paymentRec,
        subsidy: subsidyRec,
        summary: {
          grossSystemCost: Number(grossCost.toFixed(0)),
          subsidyAvailable: subsidyRec.estimatedSubsidy,
          netCost: Number(netCost.toFixed(0)),
          savingsWithSubsidy: subsidyRec.estimatedSubsidy,
        },
      },
    });
  } catch (error) {
    console.error("RECOMMENDATION ERROR:", error.message);
    res.status(500).json({ message: "Recommendation generation failed" });
  }
};
