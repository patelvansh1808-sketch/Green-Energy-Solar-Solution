const mongoose = require("mongoose");

const subsidySchema = new mongoose.Schema(
  {
    state: String,
    maxPercentage: Number,
    maxAmount: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Subsidy",
  subsidySchema,
  "subsidy_rules"
);
