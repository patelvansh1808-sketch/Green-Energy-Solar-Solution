const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Subsidy = require("../models/Subsidy");
const { sendBookingConfirmationEmail } = require("../services/emailService");

/* =====================================================
   GENERATE QUOTATION
   POST /api/bookings/quotation
===================================================== */
exports.generateQuotation = async (req, res) => {
  try {
    const { systemType, capacity, state, district } = req.body;

    if (!systemType || !capacity) {
      return res.status(400).json({
        message: "System type and capacity are required",
      });
    }

    // Base pricing per kW (can be customized)
    const pricePerKW = {
      Residential: 50000,
      Commercial: 40000,
      Industrial: 35000,
    };

    const basePrice = pricePerKW[systemType] || 50000;
    const equipmentCost = basePrice * capacity;
    const installationCost = equipmentCost * 0.2; // 20% of equipment cost
    const totalCost = equipmentCost + installationCost;

    // Fetch applicable subsidies
    let subsidyAmount = 0;
    if (state) {
      const subsidies = await Subsidy.find({
        state: state,
        isActive: true,
        validFrom: { $lte: new Date() },
        validUpto: { $gte: new Date() },
      });

      // Apply best matching subsidy
      for (const subsidy of subsidies) {
        if (
          capacity >= subsidy.minCapacityKW &&
          capacity <= subsidy.maxCapacityKW
        ) {
          if (subsidy.type === "Percentage") {
            subsidyAmount = Math.max(
              subsidyAmount,
              (totalCost * subsidy.value) / 100
            );
          } else {
            subsidyAmount = Math.max(subsidyAmount, subsidy.value);
          }
        }
      }
    }

    const netCost = totalCost - subsidyAmount;
    const roiYears = Math.round((netCost / (capacity * 12000)) * 10) / 10; // Avg yearly saving ₹12k per kW

    return res.json({
      quotation: {
        equipmentCost,
        installationCost,
        totalCost,
        subsidyAmount,
        netCost,
        roiYears,
      },
      systemType,
      capacity,
    });
  } catch (error) {
    console.error("QUOTATION GENERATION ERROR:", error);
    return res.status(500).json({
      message: "Failed to generate quotation",
      error: error.message,
    });
  }
};

/* =====================================================
   CREATE BOOKING
   POST /api/bookings/create
===================================================== */
exports.createBooking = async (req, res) => {
  try {
    const {
      systemType,
      capacity,
      installationAddress,
      roofType,
      roofArea,
      quotation,
      customerRemarks,
      // Legacy support
      baseCost,
      subsidyApplied,
      subsidyAmount,
      finalCost,
      emiEnabled,
      emiYears,
      monthlyEmi,
    } = req.body;

    if (!systemType || !capacity) {
      return res.status(400).json({
        message: "System type and capacity are required",
      });
    }

    // Check if customer exists and is active
    const customer = await Customer.findOne({ userId: req.user.id });

    if (!customer) {
      return res.status(400).json({
        message:
          "Customer profile not found. Please complete your profile before booking.",
        error: "No customer profile",
      });
    }

    if (customer.status === "Inactive") {
      return res.status(403).json({
        message:
          "Your account is inactive. Please contact support to reactivate your account.",
        error: "Customer account inactive",
      });
    }

    // Prepare booking data
    const bookingData = {
      user: req.user.id,
      customer: customer._id,
      systemType,
      capacity: Number(capacity),
      installationAddress: installationAddress || {
        address: customer.address,
        city: customer.city,
        state: customer.state,
        district: customer.district,
        pincode: customer.pincode,
      },
      roofType,
      roofArea: roofArea ? Number(roofArea) : null,
      status: "Pending",
      customerRemarks,
    };

    // Use new quotation structure if provided
    if (quotation) {
      bookingData.quotation = {
        equipmentCost: Number(quotation.equipmentCost),
        installationCost: Number(quotation.installationCost || 0),
        totalCost: Number(quotation.totalCost),
        subsidyAmount: Number(quotation.subsidyAmount || 0),
        netCost: Number(quotation.netCost),
        roiYears: quotation.roiYears,
      };
      bookingData.payment = {
        advanceAmount: Number(quotation.netCost * 0.2), // 20% advance
        finalAmount: Number(quotation.netCost * 0.8), // 80% final
      };
    } else {
      // Legacy support
      bookingData.baseCost = Number(baseCost);
      bookingData.subsidyApplied = Boolean(subsidyApplied);
      bookingData.subsidyAmount = Number(subsidyAmount || 0);
      bookingData.finalCost = Number(finalCost);
    }

    // EMI details
    if (emiEnabled) {
      bookingData.emiEnabled = true;
      bookingData.emiYears = Number(emiYears);
      bookingData.monthlyEmi = Number(monthlyEmi);
    }

    const booking = await Booking.create(bookingData);

    // Add activity log
    booking.activityLog.push({
      action: "Booking Created",
      performedBy: req.user.id,
      notes: "Initial booking created by customer",
    });
    await booking.save();

    // Create notification
    await Notification.create({
      userId: req.user.id,
      type: "booking",
      title: "Booking Submitted Successfully",
      message: `Your booking ${booking.bookingId} for ${capacity}kW ${systemType} system has been submitted and is pending review.`,
      relatedId: booking._id,
      actionUrl: `/user/bookings/${booking._id}`,
      icon: "📅",
      priority: "high",
    });

    // Get user details for email
    const user = await User.findById(req.user.id);

    // Send confirmation email
    if (user && user.email) {
      await sendBookingConfirmationEmail(user.email, user.name, {
        bookingId: booking.bookingId,
        systemType,
        capacity,
        baseCost: quotation ? quotation.equipmentCost : (baseCost || 0),
        subsidyApplied: quotation ? quotation.subsidyAmount > 0 : (subsidyApplied || false),
        subsidyAmount: quotation ? quotation.subsidyAmount : (subsidyAmount || 0),
        finalCost: quotation ? quotation.netCost : (finalCost || 0),
        emiEnabled: emiEnabled || false,
        emiYears: emiYears || 0,
        monthlyEmi: monthlyEmi || 0,
      });
    }

    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    return res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

/* =====================================================
   GET LOGGED-IN USER BOOKINGS
   GET /api/bookings/my
===================================================== */
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user.id,
    })
      .populate("customer", "fullName phone")
      .populate("assignedEngineer", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("FETCH BOOKINGS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch bookings",
    });
  }
};

/* =====================================================
   GET BOOKING BY ID
   GET /api/bookings/:id
===================================================== */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("customer", "fullName phone address city state")
      .populate("assignedEngineer", "name email phone")
      .populate("activityLog.performedBy", "name");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
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
   CANCEL BOOKING
   PATCH /api/bookings/:id/cancel
===================================================== */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Only allow cancellation if not completed
    if (booking.status === "Completed") {
      return res
        .status(400)
        .json({ message: "Cannot cancel completed booking" });
    }

    booking.status = "Cancelled";
    booking.activityLog.push({
      action: "Booking Cancelled",
      performedBy: req.user.id,
      notes: req.body.reason || "Cancelled by customer",
    });

    await booking.save();

    // Notify admin
    const admins = await User.find({ role: "Admin" });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        type: "booking",
        title: "Booking Cancelled",
        message: `Booking ${booking.bookingId} has been cancelled by the customer.`,
        relatedId: booking._id,
        icon: "❌",
        priority: "medium",
      });
    }

    res.json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);
    res.status(500).json({
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};

/* =====================================================
   DELETE BOOKING
   DELETE /api/bookings/:id
===================================================== */
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Only allow deletion if booking is in Pending or Cancelled status
    if (!["Pending", "Cancelled"].includes(booking.status)) {
      return res.status(400).json({ 
        message: "Cannot delete booking. Only Pending or Cancelled bookings can be deleted." 
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

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
