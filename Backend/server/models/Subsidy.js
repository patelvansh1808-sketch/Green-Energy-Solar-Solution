const mongoose = require("mongoose");

const subsidySchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
    },
    maxPercentage: {
      type: Number,
      required: true,
    },
    maxAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subsidy", subsidySchema);
