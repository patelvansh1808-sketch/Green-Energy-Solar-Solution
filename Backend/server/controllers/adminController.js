const User = require("../models/User");
const Booking = require("../models/Booking");

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

exports.getAllBookings = async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
};
