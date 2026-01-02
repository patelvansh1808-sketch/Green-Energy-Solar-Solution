const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  getAllUsers,
  getAllBookings,
  getAdminStats,
} = require("../controllers/adminController");

const {
  createCustomerAccount,
} = require("../controllers/adminCustomerController");

router.get("/stats", auth, role("admin"), getAdminStats);
router.get("/users", auth, role("admin"), getAllUsers);
router.get("/bookings", auth, role("admin"), getAllBookings);

router.post(
  "/create-customer",
  auth,
  role("admin"),
  createCustomerAccount
);

module.exports = router;
