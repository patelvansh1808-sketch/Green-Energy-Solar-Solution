const express = require("express");
const router = express.Router();

// ✅ IMPORT AUTH MIDDLEWARE (CORRECT NAME)
const authMiddleware = require("../middleware/authMiddleware");

// ✅ IMPORT BOOKING CONTROLLER (VERIFY PATH)
const bookingController = require("../controllers/bookingController");

/* ===============================
   USER BOOKING ROUTES
================================ */

// GENERATE QUOTATION (No auth required for instant quote)
router.post(
  "/quotation",
  bookingController.generateQuotation
);

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

// GET BOOKING BY ID
router.get(
  "/:id",
  authMiddleware,
  bookingController.getBookingById
);

// CANCEL BOOKING
router.patch(
  "/:id/cancel",
  authMiddleware,
  bookingController.cancelBooking
);

// DELETE BOOKING
router.delete(
  "/:id",
  authMiddleware,
  bookingController.deleteBooking
);

module.exports = router;
