const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendBookingConfirmationEmail } = require("../services/emailService");

/* =====================================================
   CREATE BOOKING
   POST /api/bookings/create
===================================================== */
exports.createBooking = async (req, res) => {
  try {
    const {
      systemType,
      capacity,
      baseCost,
      subsidyApplied,
      subsidyAmount,
      finalCost,
      emiEnabled,
      emiYears,
      monthlyEmi,
    } = req.body;

    if (!systemType || !capacity || !baseCost || !finalCost) {
      return res.status(400).json({
        message: "Required fields missing",
        required: ["systemType", "capacity", "baseCost", "finalCost"],
      });
    }

    // Check if customer exists and is active
    const customer = await Customer.findOne({ userId: req.user.id });
    
    if (!customer) {
      return res.status(400).json({
        message: "Customer profile not found. Please complete your profile before booking.",
        error: "No customer profile"
      });
    }

    if (customer.status === "Inactive") {
      return res.status(403).json({
        message: "Your account is inactive. Please contact support to reactivate your account.",
        error: "Customer account inactive"
      });
    }

    const booking = await Booking.create({
      user: req.user.id,
      systemType,
      capacity: Number(capacity),
      baseCost: Number(baseCost),
      subsidyApplied: Boolean(subsidyApplied),
      subsidyAmount: Number(subsidyAmount || 0),
      finalCost: Number(finalCost),
      emiEnabled: Boolean(emiEnabled),
      emiYears: emiEnabled ? Number(emiYears || 0) : null,
      monthlyEmi: emiEnabled ? Number(monthlyEmi || 0) : null,
    });

    // Create notification for booking confirmation
    await Notification.create({
      userId: req.user.id,
      type: "booking",
      title: "Booking Confirmed",
      message: `Your ${systemType} booking for ${capacity}kW has been confirmed. Final cost: ₹${finalCost.toLocaleString()}`,
      relatedId: booking._id,
      actionUrl: `/booking/${booking._id}`,
      icon: "📅",
      priority: "high",
    });

    // Get user details for email
    const user = await User.findById(req.user.id);
    
    // Send confirmation email
    if (user && user.email) {
      await sendBookingConfirmationEmail(
        user.email,
        user.name,
        {
          systemType,
          capacity,
          baseCost,
          subsidyApplied,
          subsidyAmount: subsidyAmount || 0,
          finalCost,
          emiEnabled,
          emiYears: emiYears || 0,
          monthlyEmi: monthlyEmi || 0,
        }
      );
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
    }).sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("FETCH BOOKINGS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch bookings",
    });
  }
};
