const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    message: String,
    type: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema, "alerts");
