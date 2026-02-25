const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    // System Details
    systemType: {
      type: String,
      required: true,
      enum: ["Residential", "Commercial", "Industrial"],
    },

    capacity: {
      type: Number,
      required: true,
    },

    // Installation Location Details
    installationAddress: {
      address: String,
      city: String,
      state: String,
      district: String,
      pincode: String,
    },

    roofType: {
      type: String,
      enum: [
        "",
        "Concrete",
        "Metal",
        "Tile",
        "Tiled",
        "RCC",
        "Asbestos",
        "Ground Mount",
        "Other",
      ],
      default: "",
    },

    roofArea: {
      type: Number, // in sq ft
    },

    // Quotation Details
    quotation: {
      equipmentCost: {
        type: Number,
        default: 0,
      },
      installationCost: {
        type: Number,
        default: 0,
      },
      totalCost: {
        type: Number,
        default: 0,
      },
      subsidyAmount: {
        type: Number,
        default: 0,
      },
      netCost: {
        type: Number,
        default: 0,
      },
      roiYears: {
        type: Number,
      },
    },

    // Cost Breakdown (Actuals for profit analytics)
    costBreakdown: {
      equipment: {
        type: Number,
        default: 0,
      },
      labor: {
        type: Number,
        default: 0,
      },
      logistics: {
        type: Number,
        default: 0,
      },
      permits: {
        type: Number,
        default: 0,
      },
      overhead: {
        type: Number,
        default: 0,
      },
      other: {
        type: Number,
        default: 0,
      },
      totalCost: {
        type: Number,
        default: 0,
      },
    },

    // Legacy fields (keeping for backward compatibility)
    baseCost: {
      type: Number,
      default: 0,
    },

    subsidyApplied: {
      type: Boolean,
      default: false,
    },

    subsidyAmount: {
      type: Number,
      default: 0,
    },

    finalCost: {
      type: Number,
      default: 0,
    },

    // Status Management
    status: {
      type: String,
      enum: [
        "Pending",
        "Under Review",
        "Approved",
        "Rejected",
        "Scheduled",
        "In Progress",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },

    // Dates
    bookingDate: {
      type: Date,
      default: Date.now,
    },

    expectedInstallationDate: {
      type: Date,
    },

    actualInstallationDate: {
      type: Date,
    },

    siteInspectionDate: {
      type: Date,
    },

    // Payment Tracking
    payment: {
      advanceAmount: {
        type: Number,
        default: 0,
      },
      advancePaid: {
        type: Boolean,
        default: false,
      },
      advancePaidDate: {
        type: Date,
      },
      finalAmount: {
        type: Number,
        default: 0,
      },
      finalCollectedAmount: {
        type: Number,
        default: 0,
      },
      finalPaid: {
        type: Boolean,
        default: false,
      },
      finalPaidDate: {
        type: Date,
      },
      paymentMethod: {
        type: String,
        enum: [
          "Cash",
          "Card",
          "UPI",
          "Bank Transfer",
          "Cheque",
          "Razorpay",
          "Other",
        ],
      },
      razorpayOrderId: {
        type: String,
        default: "",
      },
      razorpayPaymentId: {
        type: String,
        default: "",
      },
      razorpaySignature: {
        type: String,
        default: "",
      },
      paymentCaptured: {
        type: Boolean,
        default: false,
      },
      paymentCapturedAt: {
        type: Date,
      },
      pendingOrderStage: {
        type: String,
        enum: ["", "advance", "full", "final"],
        default: "",
      },
      finalPaymentRequested: {
        type: Boolean,
        default: false,
      },
      finalPaymentRequestedAt: {
        type: Date,
      },
      finalPaymentRequestNote: {
        type: String,
        default: "",
      },
      finalRazorpayOrderId: {
        type: String,
        default: "",
      },
      finalRazorpayPaymentId: {
        type: String,
        default: "",
      },
      finalRazorpaySignature: {
        type: String,
        default: "",
      },
    },

    // EMI Details
    emiEnabled: {
      type: Boolean,
      default: false,
    },

    emiYears: {
      type: Number,
    },

    monthlyEmi: {
      type: Number,
    },

    // Assignment
    assignedEngineer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Documents & Photos
    documents: {
      quotationPDF: String,
      agreementPDF: String,
      installationPhotos: [String],
      completionCertificate: String,
    },

    // Notes
    customerRemarks: {
      type: String,
    },

    adminNotes: {
      type: String,
    },

    rejectionReason: {
      type: String,
    },

    // Activity Log
    activityLog: [
      {
        action: String,
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate booking ID before saving
bookingSchema.pre("save", async function (next) {
  if (!this.bookingId) {
    const year = new Date().getFullYear();
    const MongoDB = require("mongoose").connection.collection("booking_counters");
    
    // Use findOneAndUpdate to atomically increment counter (prevents race conditions)
    const result = await MongoDB.findOneAndUpdate(
      { _id: `booking_${year}` },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    
    const seq = result.value?.seq || 1;
    this.bookingId = `BK-${year}-${String(seq).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
