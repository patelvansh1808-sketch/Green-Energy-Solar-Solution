const express = require("express");
const router = express.Router();

// ✅ IMPORT AUTH MIDDLEWARE (CORRECT NAME)
const authMiddleware = require("../middleware/authMiddleware");

// ✅ IMPORT BOOKING CONTROLLER (VERIFY PATH)
const bookingController = require("../controllers/bookingController");

/* ===============================
   USER BOOKING ROUTES
================================ */

// 🔴 SAFETY CHECK (TEMP – REMOVE LATER)
console.log("authMiddleware:", typeof authMiddleware);
console.log("createBooking:", typeof bookingController.createBooking);
console.log("getBookings:", typeof bookingController.getBookings);

// CREATE BOOKING
router.post(
  "/create",
  authMiddleware,
  bookingController.createBooking
);

// GET LOGGED-IN USER BOOKINGS
router.get(
  "/my",
  authMiddleware,
  bookingController.getBookings
);

module.exports = router;
