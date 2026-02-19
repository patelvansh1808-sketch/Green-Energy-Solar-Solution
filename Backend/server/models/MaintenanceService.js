const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema(
  {
    item: { type: String, required: true },
    mandatory: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const maintenanceServiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaintenancePlan",
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["Cleaning", "Testing"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Due Soon", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    workDone: {
      type: String,
      default: "",
    },
    technician: {
      type: String,
      default: "",
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reportUrl: {
      type: String,
      default: "",
    },
    executionStatus: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    technicianNotes: {
      type: String,
      default: "",
    },
    serviceChecklist: {
      type: [checklistItemSchema],
      default: [],
    },
    beforePhotos: {
      type: [String],
      default: [],
    },
    afterPhotos: {
      type: [String],
      default: [],
    },
    completionTime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenanceService", maintenanceServiceSchema);
