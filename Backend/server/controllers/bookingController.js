const Booking = require("../models/Booking");

/* =========================
   CREATE BOOKING
========================= */
exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create({
      user: req.user.id,
      ...req.body,
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (err) {
    console.error("BOOKING CREATE ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET USER BOOKINGS
========================= */
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(bookings);
  } catch (err) {
    console.error("BOOKING FETCH ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};
