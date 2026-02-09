const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const financeController = require("../controllers/financeController");

// Admin-only financial analytics
router.get(
  "/overview",
  authMiddleware,
  roleMiddleware("admin"),
  financeController.getFinancialOverview
);

router.get(
  "/reports/revenue",
  authMiddleware,
  roleMiddleware("admin"),
  financeController.getRevenueReport
);

router.get(
  "/bookings/profit",
  authMiddleware,
  roleMiddleware("admin"),
  financeController.getProjectProfitability
);

router.get(
  "/roi/company",
  authMiddleware,
  roleMiddleware("admin"),
  financeController.getCompanyRoi
);

router.get(
  "/costs/installation",
  authMiddleware,
  roleMiddleware("admin"),
  financeController.getInstallationCostAnalysis
);

router.patch(
  "/bookings/:id/costs",
  authMiddleware,
  roleMiddleware("admin"),
  financeController.updateBookingCosts
);

module.exports = router;
