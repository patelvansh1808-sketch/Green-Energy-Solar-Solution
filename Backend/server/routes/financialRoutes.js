const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  getFinancialOverview,
  getRevenueBreakdown,
  getInstallationCosts,
  getProfitMargins,
  getROIReport,
} = require("../controllers/financialController");

// All routes require admin authentication
router.use(authMiddleware);
router.use(roleMiddleware(["admin"]));

// GET /api/financial/overview - Financial overview
router.get("/overview", getFinancialOverview);

// GET /api/financial/revenue-breakdown - Revenue breakdown by month/type
router.get("/revenue-breakdown", getRevenueBreakdown);

// GET /api/financial/installation-costs - Installation cost analysis
router.get("/installation-costs", getInstallationCosts);

// GET /api/financial/profit-margins - Profit margin analysis
router.get("/profit-margins", getProfitMargins);

// GET /api/financial/roi-report - Company ROI report
router.get("/roi-report", getROIReport);

module.exports = router;
