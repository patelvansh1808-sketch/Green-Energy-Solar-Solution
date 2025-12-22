const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema(
  {
    location: String,
    temperature: Number,
    humidity: Number,
    cloudCover: Number,
    date: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Weather", weatherSchema);
