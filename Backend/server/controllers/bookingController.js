const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Subsidy = require("../models/Subsidy");
const { sendBookingConfirmationEmail } = require("../services/emailService");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const getBookingAmountBreakdown = (booking) => {
  const fullAmount = Number(
    booking?.quotation?.netCost ||
      booking?.finalCost ||
      booking?.quotation?.totalCost ||
      booking?.baseCost ||
      0
  );

  const configuredAdvance = Number(booking?.payment?.advanceAmount || 0);
  const advanceAmount = configuredAdvance > 0 ? configuredAdvance : Number((fullAmount * 0.2).toFixed(2));
  const finalAmount = Number((fullAmount - advanceAmount).toFixed(2));

  return {
    fullAmount,
    advanceAmount,
    finalAmount,
  };
};

/* =====================================================
   CREATE BOOKING PAYMENT ORDER
   POST /api/bookings/:id/payment/create-order
===================================================== */
exports.createBookingPaymentOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentMethod = req.body?.paymentMethod;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (String(booking.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Cannot pay for cancelled booking" });
    }

    if (booking.payment?.paymentCaptured) {
      return res.status(409).json({
        message: "Payment already completed for this booking",
      });
    }

    const amountBreakdown = getBookingAmountBreakdown(booking);
    const highAmountThreshold = 100000;
    const domesticCap = Number(process.env.RAZORPAY_BOOKING_TXN_CAP || 20000);
    const internationalCardCap = Number(process.env.RAZORPAY_INTERNATIONAL_CARD_CAP || 500000);
    const isInternationalCard = paymentMethod === "international_card";
    const transactionCap = isInternationalCard ? internationalCardCap : domesticCap;
    const isHighAmount = amountBreakdown.fullAmount >= highAmountThreshold;

    const requestedAmount = isInternationalCard
      ? amountBreakdown.fullAmount
      : (isHighAmount ? amountBreakdown.advanceAmount : amountBreakdown.fullAmount);
    const amount = Math.min(requestedAmount, transactionCap);
    const isCappedCharge = amount < requestedAmount;
    const paymentStage = isInternationalCard
      ? (isCappedCharge ? "advance" : "full")
      : (isHighAmount || isCappedCharge ? "advance" : "full");

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid booking amount for payment" });
    }

    const amountInPaise = Math.round(amount * 100);
    const razorpay = getRazorpayInstance();
    const receipt = `book_${Date.now()}_${String(booking._id).slice(-6)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        bookingId: String(booking._id),
        bookingCode: booking.bookingId || "",
        userId: String(req.user.id),
      },
    });

    booking.payment = {
      ...(booking.payment || {}),
      advanceAmount: paymentStage === "advance" ? amount : amountBreakdown.fullAmount,
      finalAmount: paymentStage === "advance" ? Number((amountBreakdown.fullAmount - amount).toFixed(2)) : 0,
      pendingOrderAmount: amount,
      razorpayOrderId: order.id,
      paymentMethod: "Razorpay",
      pendingOrderStage: paymentStage,
    };
    await booking.save();

    return res.json({
      message: "Booking payment order created",
      bookingId: booking._id,
      bookingCode: booking.bookingId,
      amount,
      fullAmount: amountBreakdown.fullAmount,
      advanceAmount: amountBreakdown.advanceAmount,
      finalAmount: amountBreakdown.finalAmount,
      paymentStage,
      requestedAmount,
      isCappedCharge,
      transactionCap,
      isInternationalCard,
      domesticCap,
      internationalCardCap,
      amountInPaise,
      orderId: order.id,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      recommendedMethod: amount > highAmountThreshold ? "non_upi" : "any",
      enableUpi: amount <= highAmountThreshold,
      upiLimitHint: amount > highAmountThreshold
        ? "Amount exceeds ₹1,00,000. Prefer netbanking/card/emi/bank transfer options."
        : "",
      highAmountThreshold,
    });
  } catch (error) {
    console.error("CREATE BOOKING PAYMENT ORDER ERROR:", error);
    return res.status(500).json({
      message: "Failed to create booking payment order",
      error: error.message,
    });
  }
};

/* =====================================================
   VERIFY BOOKING PAYMENT
   POST /api/bookings/:id/payment/verify
===================================================== */
exports.verifyBookingPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body || {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (String(booking.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (booking.payment?.paymentCaptured) {
      return res.json({
        message: "Payment already verified",
        booking,
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay credentials are not configured" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const pendingOrderStage = booking.payment?.pendingOrderStage || "advance";

    booking.payment = {
      ...(booking.payment || {}),
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature,
      paymentMethod: "Razorpay",
      paymentCaptured: true,
      paymentCapturedAt: new Date(),
      advancePaid:
        pendingOrderStage === "advance" || pendingOrderStage === "full"
          ? true
          : Boolean(booking.payment?.advancePaid),
      advancePaidDate:
        pendingOrderStage === "advance" || pendingOrderStage === "full"
          ? new Date()
          : booking.payment?.advancePaidDate,
      finalPaid:
        pendingOrderStage === "full"
          ? true
          : Boolean(booking.payment?.finalPaid),
      finalPaidDate:
        pendingOrderStage === "full"
          ? new Date()
          : booking.payment?.finalPaidDate,
      pendingOrderStage: "",
    };

    booking.activityLog.push({
      action: "Booking Payment Completed",
      performedBy: req.user.id,
      notes: `Razorpay payment captured: ${razorpayPaymentId}`,
    });

    await booking.save();

    return res.json({
      message: "Booking payment verified successfully",
      booking,
    });
  } catch (error) {
    console.error("VERIFY BOOKING PAYMENT ERROR:", error);
    return res.status(500).json({
      message: "Failed to verify booking payment",
      error: error.message,
    });
  }
};

/* =====================================================
   CREATE REMAINING PAYMENT ORDER
   POST /api/bookings/:id/payment/create-final-order
===================================================== */
exports.createBookingFinalPaymentOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentMethod = req.body?.paymentMethod;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (String(booking.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!booking.payment?.finalPaymentRequested) {
      return res.status(400).json({
        message: "Final payment request not raised by admin yet",
      });
    }

    if (!booking.payment?.advancePaid) {
      return res.status(400).json({ message: "Advance payment is not completed" });
    }

    if (booking.payment?.finalPaid) {
      return res.status(409).json({ message: "Final payment already completed" });
    }

    const amountBreakdown = getBookingAmountBreakdown(booking);
    const remainingAmount = Number(
      booking.payment?.finalAmount || amountBreakdown.finalAmount || 0
    );

    if (remainingAmount <= 0) {
      return res.status(400).json({ message: "No remaining amount to collect" });
    }

    // Dynamic cap based on payment method
    // Domestic card/UPI: ₹15,000 (as per Razorpay limits)
    // International card: ₹5,00,000 (as per Razorpay limits)
    // Default safe cap: ₹15,000
    const domesticCap = Number(process.env.RAZORPAY_BOOKING_TXN_CAP || 15000);
    const internationalCardCap = Number(process.env.RAZORPAY_INTERNATIONAL_CARD_CAP || 500000);
    const isInternationalCard = paymentMethod === "international_card";
    const transactionCap = isInternationalCard ? internationalCardCap : domesticCap;
    
    // For now, use safe domestic cap. Customer can pay multiple times for high amounts.
    // If they have international card, Razorpay will allow higher amount in single txn
    const transactionAmount = Math.min(remainingAmount, transactionCap);
    const isSplitPayment = remainingAmount > transactionCap;
    const totalTransactionsNeeded = isSplitPayment 
      ? Math.ceil(remainingAmount / transactionCap)
      : 1;

    const razorpay = getRazorpayInstance();
    const amountInPaise = Math.round(transactionAmount * 100);
    const receipt = `book_final_${Date.now()}_${String(booking._id).slice(-6)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        bookingId: String(booking._id),
        bookingCode: booking.bookingId || "",
        userId: String(req.user.id),
        stage: "final",
        remainingTotal: remainingAmount,
        isSplitPayment,
      },
    });

    booking.payment = {
      ...(booking.payment || {}),
      finalRazorpayOrderId: order.id,
      pendingFinalOrderAmount: transactionAmount,
      paymentMethod: "Razorpay",
      pendingOrderStage: "final",
    };
    await booking.save();

    return res.json({
      message: "Remaining payment order created",
      bookingId: booking._id,
      bookingCode: booking.bookingId,
      remainingTotal: remainingAmount,
      amount: transactionAmount,
      amountInPaise,
      orderId: order.id,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentStage: "final",
      enableUpi: transactionAmount <= 100000,
      isSplitPayment,
      totalTransactionsNeeded,
      transactionCap,
      domesticCap,
      internationalCardCap,
      isInternationalCard,
      hint: isSplitPayment 
        ? `This is transaction 1 of ${totalTransactionsNeeded}. Using international card can complete full payment in 1 transaction.`
        : "Pay full remaining amount in this transaction",
    });
  } catch (error) {
    console.error("CREATE FINAL BOOKING PAYMENT ORDER ERROR:", error);
    return res.status(500).json({
      message: "Failed to create remaining payment order",
      error: error.message,
    });
  }
};

/* =====================================================
   VERIFY REMAINING PAYMENT
   POST /api/bookings/:id/payment/verify-final
===================================================== */
exports.verifyBookingFinalPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body || {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (String(booking.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (booking.payment?.finalPaid) {
      return res.json({ message: "Final payment already verified", booking });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Final payment verification failed" });
    }

    // Get the current payment details
    const previousFinalAmount = Number(booking.payment?.finalAmount || 0);
    const previousCollected = Number(booking.payment?.finalCollectedAmount || 0);
    const transactionAmount = Number(
      booking.payment?.pendingFinalOrderAmount ||
      Math.min(previousFinalAmount, Number(process.env.RAZORPAY_BOOKING_TXN_CAP || 15000))
    );
    
    // Simplified: amountBreakdown already has totalAmount calculated
    const amountBreakdown = getBookingAmountBreakdown(booking);
    const totalFinalAmount = amountBreakdown.finalAmount;
    const currentCollected = previousCollected + (transactionAmount > 0 ? transactionAmount : 0);
    const newRemainingAmount = Math.max(0, totalFinalAmount - currentCollected);
    
    const isFinalPaymentComplete = newRemainingAmount <= 0;

    booking.payment = {
      ...(booking.payment || {}),
      finalRazorpayOrderId: razorpayOrderId,
      finalRazorpayPaymentId: razorpayPaymentId,
      finalRazorpaySignature: razorpaySignature,
      finalCollectedAmount: currentCollected,
      finalAmount: newRemainingAmount,
      finalPaid: isFinalPaymentComplete,
      finalPaidDate: isFinalPaymentComplete ? new Date() : booking.payment?.finalPaidDate,
      finalPaymentRequested: !isFinalPaymentComplete, // Keep requesting if amount remaining
      pendingFinalOrderAmount: 0,
      pendingOrderStage: "",
      paymentMethod: "Razorpay",
    };

    booking.activityLog.push({
      action: "Final Payment Received",
      performedBy: req.user.id,
      notes: `Razorpay final payment captured: ${razorpayPaymentId}. Remaining: ₹${newRemainingAmount.toLocaleString("en-IN")}`,
    });

    await booking.save();

    return res.json({
      message: isFinalPaymentComplete 
        ? "Final payment completed successfully" 
        : "Partial payment received. Please pay remaining amount.",
      booking,
      paymentStatus: {
        isFinalPaymentComplete,
        totalAmount: totalFinalAmount,
        collectedAmount: currentCollected,
        remainingAmount: newRemainingAmount,
      },
    });
  } catch (error) {
    console.error("VERIFY FINAL BOOKING PAYMENT ERROR:", error);
    return res.status(500).json({
      message: "Failed to verify remaining payment",
      error: error.message,
    });
  }
};

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

    if (error?.code === 11000 && error?.keyPattern?.bookingId) {
      return res.status(409).json({
        message: "Booking reference generation conflict. Please retry once.",
        error: "Duplicate bookingId",
      });
    }

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
