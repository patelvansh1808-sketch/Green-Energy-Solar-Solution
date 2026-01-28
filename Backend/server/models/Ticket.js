const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "technical",
        "billing",
        "installation",
        "maintenance",
        "warranty",
        "general",
        "complaint",
        "feedback",
      ],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "pending", "resolved", "closed"],
      default: "open",
    },
    description: {
      type: String,
      required: true,
    },
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedToName: String,
    responses: [
      {
        respondedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        responderName: String,
        responderRole: String,
        message: String,
        isCustomerResponse: Boolean,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        attachments: [String],
      },
    ],
    resolution: {
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      resolverName: String,
      resolutionDate: Date,
      resolutionNotes: String,
      customerSatisfaction: {
        type: Number,
        min: 1,
        max: 5,
      },
      customerFeedback: String,
    },
    tags: [String],
    internalNotes: [
      {
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        note: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-generate ticket number
ticketSchema.pre("save", async function (next) {
  if (!this.ticketNumber) {
    const count = await mongoose.models.Ticket.countDocuments();
    this.ticketNumber = `TKT-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model("Ticket", ticketSchema);
