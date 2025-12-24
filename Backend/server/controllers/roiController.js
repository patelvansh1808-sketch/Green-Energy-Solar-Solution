const { calculateROI } = require("../utils/roiCalculator");
const { generateROIReport } = require("../utils/pdfGenerator");

/**
 * @route   POST /api/roi/calculate
 * @desc    Calculate ROI & Break-Even Analysis
 * @access  Private
 */
exports.getROIAnalysis = (req, res) => {
  try {
    let {
      installationCost,
      subsidy,
      annualEnergy,
      electricityRate,
      years,
    } = req.body;

    // ✅ Force number conversion
    installationCost = Number(installationCost);
    subsidy = Number(subsidy);
    annualEnergy = Number(annualEnergy);
    electricityRate = Number(electricityRate);
    years = Number(years) || 25;

    // ✅ Strong validation
    if (
      isNaN(installationCost) ||
      isNaN(subsidy) ||
      isNaN(annualEnergy) ||
      isNaN(electricityRate) ||
      installationCost <= 0 ||
      annualEnergy <= 0 ||
      electricityRate <= 0
    ) {
      return res.status(400).json({
        message: "Invalid ROI input values",
      });
    }

    const result = calculateROI({
      installationCost,
      subsidy,
      annualEnergy,
      electricityRate,
      years,
    });

    res.status(200).json({
      message: "ROI calculation successful",
      data: result,
    });
  } catch (error) {
    console.error("ROI ERROR:", error);
    res.status(500).json({
      message: "ROI calculation failed",
    });
  }
};

/**
 * @route   POST /api/roi/report
 * @desc    Download ROI report as PDF
 * @access  Private
 */
exports.downloadROIReport = (req, res) => {
  try {
    let {
      installationCost,
      subsidy,
      annualEnergy,
      electricityRate,
      years,
    } = req.body;

    // ✅ Force number conversion
    installationCost = Number(installationCost);
    subsidy = Number(subsidy);
    annualEnergy = Number(annualEnergy);
    electricityRate = Number(electricityRate);
    years = Number(years) || 25;

    // ✅ Validation
    if (
      isNaN(installationCost) ||
      isNaN(annualEnergy) ||
      isNaN(electricityRate) ||
      installationCost <= 0 ||
      annualEnergy <= 0 ||
      electricityRate <= 0
    ) {
      return res.status(400).json({
        message: "Invalid ROI input values for PDF",
      });
    }

    const roiData = calculateROI({
      installationCost,
      subsidy,
      annualEnergy,
      electricityRate,
      years,
    });

    // ✅ Generate and stream PDF
    generateROIReport(res, roiData);
  } catch (error) {
    console.error("ROI PDF ERROR:", error);
    res.status(500).json({
      message: "Failed to download ROI report",
    });
  }
};
