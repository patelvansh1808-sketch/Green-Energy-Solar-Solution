const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createBooking,
  getBookings,
} = require("../controllers/bookingController");

router.post("/create", auth, createBooking);
router.get("/my", auth, getBookings);

module.exports = router;
