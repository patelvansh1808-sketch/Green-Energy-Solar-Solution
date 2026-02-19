const mongoose = require("mongoose");

const maintenancePlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planType: {
      type: String,
      enum: ["1 Month", "6 Months", "1 Year", "Lifetime"],
      required: true,
    },
    durationMonths: {
      type: Number,
      default: 0,
    },
    servicesTotal: {
      type: Number,
      default: 0,
    },
    servicesUsed: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Expired", "Cancelled"],
      default: "Active",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    nextServiceDate: {
      type: Date,
    },
    planPrice: {
      type: Number,
      default: 0,
    },
    taxPercent: {
      type: Number,
      default: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenancePlan", maintenancePlanSchema);
