const User = require("../models/User");
const Booking = require("../models/Booking");
const Energy = require("../models/Energy");
const Subsidy = require("../models/Subsidy");
const Customer = require("../models/Customer");
const Notification = require("../models/Notification");

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
    const { scope } = req.query || {};
    const query = {};

    if (scope === "customers") {
      query.role = { $in: ["user", "customer"] };
    }

    const users = await User.find(query).select("-password");
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
      .populate("customer", "fullName phone address city state district pincode")
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

exports.requestRemainingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { note } = req.body || {};

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.payment?.advancePaid) {
      return res.status(400).json({
        message: "Advance payment is not completed yet",
      });
    }

    if (booking.payment?.finalPaid) {
      return res.status(409).json({ message: "Final payment already completed" });
    }

    if (booking.status !== "In Progress") {
      return res.status(400).json({
        message: "Remaining payment request is allowed when installation is In Progress",
      });
    }

    booking.payment = {
      ...(booking.payment || {}),
      finalPaymentRequested: true,
      finalPaymentRequestedAt: new Date(),
      finalPaymentRequestNote: String(note || "Please complete remaining payment to continue installation.").trim(),
    };

    await booking.save();

    await Notification.create({
      userId: booking.user,
      type: "booking",
      title: "Remaining Payment Request",
      message: `Please complete your remaining payment for booking ${booking.bookingId || booking._id}.`,
      relatedId: booking._id,
      actionUrl: "/booking-status",
      icon: "💳",
      priority: "high",
    });

    return res.json({
      message: "Remaining payment request sent to customer",
      booking,
    });
  } catch (err) {
    console.error("REQUEST REMAINING PAYMENT ERROR:", err.message);
    return res.status(500).json({ message: err.message });
  }
};
