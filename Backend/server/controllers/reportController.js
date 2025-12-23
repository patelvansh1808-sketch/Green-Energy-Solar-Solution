const { generatePDF } = require("../utils/pdfGenerator");
const Energy = require("../models/Energy");

exports.generateReport = async (req, res) => {
  try {
    const data = await Energy.find({ userId: req.user.id });
    generatePDF(data, res);
  } catch (error) {
    res.status(500).json({ message: "Report generation failed" });
  }
};
