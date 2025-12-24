const User = require("../models/User");
const Booking = require("../models/Booking");
const Energy = require("../models/Energy");
const Subsidy = require("../models/Subsidy");

/**
 * ================================
 * ADMIN DASHBOARD STATS
 * ================================
 */
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingSubsidies = await Subsidy.countDocuments({
      status: "pending",
    });

    const totalEnergy = await Energy.aggregate([
      { $group: { _id: null, total: { $sum: "$generatedKwh" } } },
    ]);

    res.json({
      totalUsers,
      totalBookings,
      pendingSubsidies,
      totalEnergy: totalEnergy[0]?.total || 0,
    });
  } catch (err) {
    console.error("ADMIN STATS ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/**
 * ================================
 * GET ALL USERS (ADMIN)
 * ================================
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/**
 * ================================
 * GET ALL BOOKINGS (ADMIN)
 * ================================
 */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email connectionType location")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("GET BOOKINGS ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/**
 * ================================
 * UPDATE BOOKING STATUS (OPTIONAL)
 * ================================
 * Example: approve / reject booking
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      message: "Booking status updated",
      booking,
    });
  } catch (err) {
    console.error("UPDATE BOOKING ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};
