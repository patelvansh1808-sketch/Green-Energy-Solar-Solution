const mongoose = require("mongoose");

const progressLogSchema = new mongoose.Schema(
  {
    percent: { type: Number, min: 0, max: 100 },
    note: { type: String },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const installationSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },

    siteSurvey: {
      scheduledDate: { type: Date },
      status: { type: String, enum: ["pending", "scheduled", "completed"], default: "pending" },
      notes: { type: String },
    },

    assignedEngineer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: [
        "survey_pending",
        "survey_completed",
        "engineer_assigned",
        "install_in_progress",
        "commissioning_done",
        "live",
      ],
      default: "survey_pending",
    },

    progress: { type: Number, min: 0, max: 100, default: 0 },
    progressLogs: [progressLogSchema],

    commissioning: {
      date: { type: Date },
      status: { type: String, enum: ["pending", "completed"], default: "pending" },
      notes: { type: String },
    },

    goLive: {
      date: { type: Date },
      confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["pending", "confirmed"], default: "pending" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Installation", installationSchema);
