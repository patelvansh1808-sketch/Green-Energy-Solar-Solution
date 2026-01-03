const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      enum: ["support", "feedback", "inquiry", "complaint"],
      default: "inquiry",
    },

    subject: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    attachments: [
      {
        filename: String,
        url: String,
      },
    ],

    replies: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: String,
        isAdminReply: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    lastReplyAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
