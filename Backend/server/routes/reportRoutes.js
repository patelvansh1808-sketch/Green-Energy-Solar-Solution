const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  generateReport,
  generateMonthlyEnergyPDF,
  generateMonthlyEnergyExcel,
  generateCostSavingsPDF,
  generateBookingInvoicePDF,
} = require("../controllers/reportController");

router.get("/generate", auth, generateReport);
router.get("/energy/monthly/pdf", auth, generateMonthlyEnergyPDF);
router.get("/energy/monthly/excel", auth, generateMonthlyEnergyExcel);
router.get("/cost-savings/pdf", auth, generateCostSavingsPDF);
router.get("/booking/invoice/:bookingId", auth, generateBookingInvoicePDF);

module.exports = router;
