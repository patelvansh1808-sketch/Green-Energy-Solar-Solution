const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createBooking,
  getBookings,
} = require("../controllers/bookingController");

// Create new booking
router.post("/create", auth, createBooking);

// Get logged-in user's bookings
router.get("/my", auth, getBookings);

module.exports = router;
