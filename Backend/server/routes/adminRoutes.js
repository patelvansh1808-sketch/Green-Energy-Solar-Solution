const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  getAllUsers,
  getAllBookings,
  getAdminStats,
  updateBookingStatus,
} = require("../controllers/adminController");

const {
  createCustomerAccount,
} = require("../controllers/adminCustomerController");

router.get("/stats", auth, role("admin"), getAdminStats);
router.get("/users", auth, role("admin"), getAllUsers);
router.get("/bookings", auth, role("admin"), getAllBookings);
router.patch("/bookings/:bookingId", auth, role("admin"), updateBookingStatus);

router.post(
  "/create-customer",
  auth,
  role("admin"),
  createCustomerAccount
);

module.exports = router;
