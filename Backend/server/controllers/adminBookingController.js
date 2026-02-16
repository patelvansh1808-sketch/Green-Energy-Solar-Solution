const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const User = require("../models/User");
const Notification = require("../models/Notification");

/* =====================================================
   GET ALL BOOKINGS (ADMIN)
   GET /api/admin/bookings
===================================================== */
exports.getAllBookings = async (req, res) => {
  try {
    const { status, systemType, startDate, endDate } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (systemType) filter.systemType = systemType;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(filter)
      .populate("user", "name email phone")
      .populate("customer", "fullName phone city state")
      .populate("assignedEngineer", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("FETCH ALL BOOKINGS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

/* =====================================================
   GET BOOKING BY ID (ADMIN)
   GET /api/admin/bookings/:id
===================================================== */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("customer")
      .populate("assignedEngineer", "name email phone")
      .populate("activityLog.performedBy", "name");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("FETCH BOOKING ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};

/* =====================================================
   APPROVE BOOKING
   PATCH /api/admin/bookings/:id/approve
===================================================== */
exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "Pending" && booking.status !== "Under Review") {
      return res.status(400).json({
        message: `Cannot approve booking with status: ${booking.status}`,
      });
    }

    booking.status = "Approved";
    booking.adminNotes = req.body.notes || booking.adminNotes;
    booking.activityLog.push({
      action: "Booking Approved",
      performedBy: req.user.id,
      notes: req.body.notes || "Booking approved by admin",
    });

    await booking.save();

    // Notify customer
    await Notification.create({
      userId: booking.user,
      type: "booking",
      title: "Booking Approved! 🎉",
      message: `Your booking ${booking.bookingId} has been approved. We will schedule the installation soon.`,
      relatedId: booking._id,
      actionUrl: `/user/bookings/${booking._id}`,
      icon: "✅",
      priority: "high",
    });

    res.json({
      message: "Booking approved successfully",
      booking,
    });
  } catch (error) {
    console.error("APPROVE BOOKING ERROR:", error);
    res.status(500).json({
      message: "Failed to approve booking",
      error: error.message,
    });
  }
};

/* =====================================================
   REJECT BOOKING
   PATCH /api/admin/bookings/:id/reject
===================================================== */
exports.rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({
        message: "Cannot reject completed booking",
      });
    }

    booking.status = "Rejected";
    booking.rejectionReason = reason;
    booking.activityLog.push({
      action: "Booking Rejected",
      performedBy: req.user.id,
      notes: reason,
    });

    await booking.save();

    // Notify customer
    await Notification.create({
      userId: booking.user,
      type: "booking",
      title: "Booking Rejected",
      message: `Your booking ${booking.bookingId} has been rejected. Reason: ${reason}`,
      relatedId: booking._id,
      actionUrl: `/user/bookings/${booking._id}`,
      icon: "❌",
      priority: "high",
    });

    res.json({
      message: "Booking rejected",
      booking,
    });
  } catch (error) {
    console.error("REJECT BOOKING ERROR:", error);
    res.status(500).json({
      message: "Failed to reject booking",
      error: error.message,
    });
  }
};

/* =====================================================
   SCHEDULE INSTALLATION
   PATCH /api/admin/bookings/:id/schedule
===================================================== */
exports.scheduleInstallation = async (req, res) => {
  try {
    const { expectedInstallationDate, siteInspectionDate, assignedEngineerId } =
      req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "Approved") {
      return res.status(400).json({
        message: "Only approved bookings can be scheduled",
      });
    }

    booking.status = "Scheduled";
    if (expectedInstallationDate)
      booking.expectedInstallationDate = new Date(expectedInstallationDate);
    if (siteInspectionDate)
      booking.siteInspectionDate = new Date(siteInspectionDate);
    if (assignedEngineerId) booking.assignedEngineer = assignedEngineerId;

    booking.activityLog.push({
      action: "Installation Scheduled",
      performedBy: req.user.id,
      notes: `Installation scheduled for ${new Date(
        expectedInstallationDate
      ).toLocaleDateString()}`,
    });

    await booking.save();

    // Notify customer
    await Notification.create({
      userId: booking.user,
      type: "booking",
      title: "Installation Scheduled",
      message: `Your installation is scheduled for ${new Date(
        expectedInstallationDate
      ).toLocaleDateString()}`,
      relatedId: booking._id,
      actionUrl: `/user/bookings/${booking._id}`,
      icon: "📅",
      priority: "high",
    });

    // Notify assigned engineer
    if (assignedEngineerId) {
      await Notification.create({
        userId: assignedEngineerId,
        type: "booking",
        title: "New Installation Assigned",
        message: `You have been assigned to installation ${booking.bookingId}`,
        relatedId: booking._id,
        icon: "🔧",
        priority: "high",
      });
    }

    res.json({
      message: "Installation scheduled successfully",
      booking,
    });
  } catch (error) {
    console.error("SCHEDULE INSTALLATION ERROR:", error);
    res.status(500).json({
      message: "Failed to schedule installation",
      error: error.message,
    });
  }
};

/* =====================================================
   UPDATE BOOKING STATUS
   PATCH /api/admin/bookings/:id/status
===================================================== */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const validStatuses = [
      "Pending",
      "Under Review",
      "Approved",
      "Rejected",
      "Scheduled",
      "In Progress",
      "Completed",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        validStatuses,
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const oldStatus = booking.status;
    booking.status = status;

    // If marking as completed, set actual installation date
    if (status === "Completed" && !booking.actualInstallationDate) {
      booking.actualInstallationDate = new Date();
    }

    booking.activityLog.push({
      action: `Status Changed: ${oldStatus} → ${status}`,
      performedBy: req.user.id,
      notes: notes || `Status updated to ${status}`,
    });

    await booking.save();

    // Notify customer
    await Notification.create({
      userId: booking.user,
      type: "booking",
      title: `Booking Status Updated`,
      message: `Your booking ${booking.bookingId} status: ${status}`,
      relatedId: booking._id,
      actionUrl: `/user/bookings/${booking._id}`,
      icon: "🔔",
      priority: "medium",
    });

    res.json({
      message: "Booking status updated",
      booking,
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({
      message: "Failed to update status",
      error: error.message,
    });
  }
};

/* =====================================================
   ASSIGN ENGINEER
   PATCH /api/admin/bookings/:id/assign
===================================================== */
exports.assignEngineer = async (req, res) => {
  try {
    const { engineerId } = req.body;

    if (!engineerId) {
      return res.status(400).json({ message: "Engineer ID is required" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const engineer = await User.findById(engineerId);
    if (!engineer) {
      return res.status(404).json({ message: "Engineer not found" });
    }

    booking.assignedEngineer = engineerId;
    booking.activityLog.push({
      action: "Engineer Assigned",
      performedBy: req.user.id,
      notes: `Assigned to ${engineer.name}`,
    });

    await booking.save();

    // Notify engineer
    await Notification.create({
      userId: engineerId,
      type: "booking",
      title: "New Installation Assignment",
      message: `You have been assigned to booking ${booking.bookingId}`,
      relatedId: booking._id,
      icon: "🔧",
      priority: "high",
    });

    res.json({
      message: "Engineer assigned successfully",
      booking,
    });
  } catch (error) {
    console.error("ASSIGN ENGINEER ERROR:", error);
    res.status(500).json({
      message: "Failed to assign engineer",
      error: error.message,
    });
  }
};

/* =====================================================
   UPDATE PAYMENT STATUS
   PATCH /api/admin/bookings/:id/payment
===================================================== */
exports.updatePayment = async (req, res) => {
  try {
    const { paymentType, amount, method, paid } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (paymentType === "advance") {
      booking.payment.advanceAmount = amount || booking.payment.advanceAmount;
      booking.payment.advancePaid = paid;
      if (paid) booking.payment.advancePaidDate = new Date();
      if (method) booking.payment.paymentMethod = method;
    } else if (paymentType === "final") {
      booking.payment.finalAmount = amount || booking.payment.finalAmount;
      booking.payment.finalPaid = paid;
      if (paid) booking.payment.finalPaidDate = new Date();
      if (method) booking.payment.paymentMethod = method;
    }

    booking.activityLog.push({
      action: `Payment Updated`,
      performedBy: req.user.id,
      notes: `${paymentType} payment: ${paid ? "Paid" : "Pending"} - ₹${amount}`,
    });

    await booking.save();

    res.json({
      message: "Payment updated successfully",
      booking,
    });
  } catch (error) {
    console.error("UPDATE PAYMENT ERROR:", error);
    res.status(500).json({
      message: "Failed to update payment",
      error: error.message,
    });
  }
};

/* =====================================================
   DELETE BOOKING
   DELETE /api/admin/bookings/:id
===================================================== */
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("DELETE BOOKING ERROR:", error);
    res.status(500).json({
      message: "Failed to delete booking",
      error: error.message,
    });
  }
};

/* =====================================================
   GET BOOKING STATISTICS
   GET /api/admin/bookings/stats
===================================================== */
exports.getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "Pending" });
    const approvedBookings = await Booking.countDocuments({
      status: "Approved",
    });
    const completedBookings = await Booking.countDocuments({
      status: "Completed",
    });
    const cancelledBookings = await Booking.countDocuments({
      status: "Cancelled",
    });

    // Revenue calculation
    const completed = await Booking.find({ status: "Completed" });
    const totalRevenue = completed.reduce((sum, booking) => {
      return sum + (booking.quotation?.netCost || booking.finalCost || 0);
    }, 0);

    // Pipeline revenue (approved + scheduled + in progress)
    const pipeline = await Booking.find({
      status: { $in: ["Approved", "Scheduled", "In Progress"] },
    });
    const pipelineRevenue = pipeline.reduce((sum, booking) => {
      return sum + (booking.quotation?.netCost || booking.finalCost || 0);
    }, 0);

    res.json({
      totalBookings,
      pendingBookings,
      approvedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      pipelineRevenue,
      conversionRate:
        totalBookings > 0
          ? ((completedBookings / totalBookings) * 100).toFixed(2)
          : 0,
    });
  } catch (error) {
    console.error("GET STATS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};
