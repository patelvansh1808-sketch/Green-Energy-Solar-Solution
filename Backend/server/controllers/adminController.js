const User = require("../models/User");
const Booking = require("../models/Booking");
const Energy = require("../models/Energy");
const Subsidy = require("../models/Subsidy");
const Customer = require("../models/Customer");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Alert = require("../models/Alert");
const Message = require("../models/Message");
const Ticket = require("../models/Ticket");
const SubsidyApplication = require("../models/SubsidyApplication");
const MaintenancePlan = require("../models/MaintenancePlan");
const MaintenanceService = require("../models/MaintenanceService");
const MaintenancePayment = require("../models/MaintenancePayment");
const MaintenanceReport = require("../models/MaintenanceReport");
const Project = require("../models/Project");
const Installation = require("../models/Installation");
const Lead = require("../models/Lead");

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
 * UPDATE USER PASSWORD (ADMIN)
 * ================================
 */
exports.updateUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body || {};

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    if (
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    ) {
      return res.status(400).json({
        message:
          "Password must include uppercase, lowercase, number, and special character",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: { password: hashedPassword },
        $unset: { refreshToken: 1 },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User password updated successfully" });
  } catch (err) {
    console.error("UPDATE USER PASSWORD ERROR:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * ================================
 * DELETE USER + RELATED DATA (ADMIN)
 * ================================
 */
exports.deleteUserWithRelatedData = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (String(req.user?.id) === String(userId)) {
      return res.status(400).json({
        message: "You cannot delete your own admin account",
      });
    }

    const user = await User.findById(userId).select("_id role email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Keep staff/admin deletion out of this flow. Role management is handled separately.
    const allowedRoles = ["user", "customer"];
    if (!allowedRoles.includes(String(user.role || "").toLowerCase())) {
      return res.status(400).json({
        message:
          "Only customer/user accounts can be deleted from this page",
      });
    }

    const customer = await Customer.findOne({ userId: user._id }).select("_id");
    const customerId = customer?._id;

    const deleteTasks = [
      Notification.deleteMany({ userId: user._id }),
      Message.deleteMany({ userId: user._id }),
      MaintenancePlan.deleteMany({ userId: user._id }),
      MaintenanceService.deleteMany({ userId: user._id }),
      MaintenancePayment.deleteMany({ userId: user._id }),
      MaintenanceReport.deleteMany({ userId: user._id }),
      Booking.deleteMany({ user: user._id }),
      Energy.deleteMany({ userId: user._id }),
      Alert.deleteMany({ userId: user._id }),
    ];

    if (customerId) {
      deleteTasks.push(
        Customer.deleteOne({ _id: customerId }),
        SubsidyApplication.deleteMany({ customerId }),
        Ticket.deleteMany({ customerId }),
        Project.deleteMany({ customerId }),
        Installation.deleteMany({ customer: customerId }),
        Lead.deleteMany({ "conversion.customerId": customerId }),
        Booking.deleteMany({ customer: customerId }),
        Energy.deleteMany({ customerId }),
        Alert.deleteMany({ customerId })
      );
    }

    if (user.email) {
      deleteTasks.push(Ticket.deleteMany({ customerEmail: user.email }));
    }

    await Promise.all(deleteTasks);
    await User.deleteOne({ _id: user._id });

    return res.json({
      message: "User profile and related data deleted successfully",
    });
  } catch (err) {
    console.error("DELETE USER WITH RELATED DATA ERROR:", err.message);
    return res.status(500).json({ message: err.message });
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
