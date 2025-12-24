const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    systemType: {
      type: String,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
    },

    baseCost: {
      type: Number,
      required: true,
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
      required: true,
    },

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
