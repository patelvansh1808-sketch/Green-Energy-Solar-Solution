const mongoose = require("mongoose");

const energySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    date: {
      type: Date,
      required: true,
    },
    unitsGenerated: {
      type: Number,
      required: true,
      default: 0,
    },
    peakPower: {
      type: Number,
      default: 0,
    },
    efficiency: {
      type: Number,
      default: 0,
    },
    temperature: {
      type: Number,
      default: 0,
    },
    inverterStatus: {
      type: String,
      enum: ["online", "offline", "warning"],
      default: "online",
    },
    notes: String,
  },
  { timestamps: true }
);

// Index for fast queries by userId and date
energySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Energy", energySchema);
