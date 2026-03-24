const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  getAllUsers,
  updateUserPassword,
  deleteUserWithRelatedData,
  getAllBookings,
  getAdminStats,
  updateBookingStatus,
  requestRemainingPayment,
} = require("../controllers/adminController");

const {
  createCustomerAccount,
} = require("../controllers/adminCustomerController");

router.get("/stats", auth, role("admin"), getAdminStats);
router.get("/users", auth, role("admin"), getAllUsers);
router.patch("/users/:userId/password", auth, role("admin"), updateUserPassword);
router.delete("/users/:userId", auth, role("admin"), deleteUserWithRelatedData);
router.get("/bookings", auth, role("admin"), getAllBookings);
router.patch("/bookings/:bookingId", auth, role("admin"), updateBookingStatus);
router.post(
  "/bookings/:bookingId/request-remaining-payment",
  auth,
  role("admin"),
  requestRemainingPayment
);

router.post(
  "/create-customer",
  auth,
  role("admin"),
  createCustomerAccount
);

module.exports = router;
