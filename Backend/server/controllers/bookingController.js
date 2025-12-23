const Booking = require("../models/Booking");

exports.createBooking = async (req, res) => {
  const booking = await Booking.create({
    userId: req.user.id,
    panelType: req.body.panelType,
    capacityKW: req.body.capacityKW,
    estimatedCost: req.body.estimatedCost,
  });

  res.status(201).json(booking);
};

exports.getBookings = async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.id });
  res.json(bookings);
};
