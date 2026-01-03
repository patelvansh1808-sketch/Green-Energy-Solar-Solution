const User = require("../models/User");
const Booking = require("../models/Booking");
const Energy = require("../models/Energy");
const Subsidy = require("../models/Subsidy");
const Customer = require("../models/Customer");

/**
 * ================================
 * ADMIN DASHBOARD STATS
 * ================================
 */
exports.getAdminStats = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingSubsidies = await Subsidy.countDocuments({
      status: "pending",
    });

    // Customer stats
    const activeCustomers = await Customer.countDocuments({ status: "Active" });
    const inactiveCustomers = await Customer.countDocuments({ status: "Inactive" });

    // Energy stats
    const totalEnergy = await Energy.aggregate([
      { $group: { _id: null, total: { $sum: "$generatedKwh" } } },
    ]);

    // Recent activity - bookings
    const recentBookings = await Booking.find()
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("user status createdAt");

    // Recent activity - customer status changes
    const recentCustomers = await Customer.find()
      .select("fullName status updatedAt")
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      activeCustomers,
      inactiveCustomers,
      totalBookings,
      pendingSubsidies,
      totalEnergy: totalEnergy[0]?.total || 0,
      recentBookings,
      recentCustomers,
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
