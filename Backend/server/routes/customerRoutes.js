const express = require("express");
const router = express.Router();

const {
  createCustomer,
  getMyCustomerProfile,
  getAllCustomers,
  updateCustomerStatus,
} = require("../controllers/customerController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Admin routes
router.post("/", authMiddleware, roleMiddleware("admin"), createCustomer);
router.get("/", authMiddleware, roleMiddleware("admin"), getAllCustomers);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  updateCustomerStatus
);

// Customer route
router.get("/me", authMiddleware, getMyCustomerProfile);

module.exports = router;
