const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["booking", "subsidy", "alert", "system", "promotion"],
      default: "system",
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    emailSent: {
      type: Boolean,
      default: false,
    },

    actionUrl: {
      type: String,
    },

    icon: {
      type: String,
      default: "📬",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
