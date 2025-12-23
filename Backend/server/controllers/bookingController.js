const Booking = require("../models/Booking");

exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create({
      user: req.user.id, // comes from auth middleware
      ...req.body,
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (err) {
    console.error("BOOKING ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};
