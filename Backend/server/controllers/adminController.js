const User = require("../server/config/models/User");
const Booking = require("../server/config/models/Booking");

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

exports.getAllBookings = async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
};
