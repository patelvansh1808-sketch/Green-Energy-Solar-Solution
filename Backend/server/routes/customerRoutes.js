const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createCustomer,
  getMyCustomerProfile,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  updateCustomerStatus,
} = require("../controllers/customerController");

/* =====================
   CUSTOMER ROUTES
===================== */

// User: view own customer profile (MUST be before /:id to avoid conflict)
router.get("/me", authMiddleware, getMyCustomerProfile);

// Admin: create customer
router.post("/", authMiddleware, roleMiddleware("admin"), createCustomer);

// Admin: get all customers (will be matched before /:id due to exact path)
router.get("/", authMiddleware, roleMiddleware("admin"), getAllCustomers);

// Admin: get single customer by ID
router.get("/:id", authMiddleware, roleMiddleware("admin"), getCustomerById);

// Admin: update customer details (PUT)
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateCustomer);

// Admin: update customer details (PATCH)
router.patch("/:id", authMiddleware, roleMiddleware("admin"), updateCustomer);

// Admin: activate / deactivate customer status (MUST be after generic /:id)
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  updateCustomerStatus
);

module.exports = router;
