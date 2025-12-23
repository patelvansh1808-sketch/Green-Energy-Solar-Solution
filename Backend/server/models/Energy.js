const mongoose = require("mongoose");

const energySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: Date,
    unitsGenerated: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Energy",
  energySchema,
  "energy_generation"
);
