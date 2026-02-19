const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema(
  {
    item: { type: String, required: true },
    mandatory: { type: Boolean, default: false },
  },
  { _id: false }
);

const maintenanceSettingSchema = new mongoose.Schema(
  {
    settingsKey: {
      type: String,
      default: "default",
      unique: true,
    },
    planPricing: {
      oneMonth: {
        price: { type: Number, default: 999 },
        taxPercent: { type: Number, default: 18 },
        discountPercent: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
      sixMonths: {
        price: { type: Number, default: 4999 },
        taxPercent: { type: Number, default: 18 },
        discountPercent: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
      oneYear: {
        price: { type: Number, default: 8999 },
        taxPercent: { type: Number, default: 18 },
        discountPercent: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
      lifetime: {
        price: { type: Number, default: 24999 },
        taxPercent: { type: Number, default: 18 },
        discountPercent: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
    },
    numberOfVisitsPerPlan: {
      oneMonth: { type: Number, default: 1 },
      sixMonths: { type: Number, default: 6 },
      oneYear: { type: Number, default: 12 },
      lifetime: { type: Number, default: 24 },
      extraVisitCharge: { type: Number, default: 499 },
      unusedVisitRule: {
        type: String,
        enum: ["carry_forward", "expire"],
        default: "expire",
      },
    },
    defaultServiceChecklist: {
      cleaning: {
        type: [checklistItemSchema],
        default: [
          { item: "Panel surface cleaning", mandatory: true },
          { item: "Visual inspection of wiring", mandatory: true },
          { item: "Inverter dust check", mandatory: false },
        ],
      },
      testing: {
        type: [checklistItemSchema],
        default: [
          { item: "Voltage output test", mandatory: true },
          { item: "Inverter performance test", mandatory: true },
          { item: "Earthing continuity check", mandatory: false },
        ],
      },
      technicianNotesTemplate: {
        type: String,
        default: "Summary of work done, observations, and customer confirmation.",
      },
    },
    serviceFrequencyRules: {
      autoScheduleFrequency: {
        type: String,
        enum: ["monthly", "quarterly", "half_yearly", "yearly"],
        default: "monthly",
      },
      minimumGapDays: { type: Number, default: 20 },
      rescheduleWindowDays: { type: Number, default: 7 },
      graceDays: { type: Number, default: 3 },
      holidayBlackoutHandling: {
        type: String,
        enum: ["skip_to_next_available", "manual_approval"],
        default: "skip_to_next_available",
      },
      blackoutDates: {
        type: [String],
        default: [],
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenanceSetting", maintenanceSettingSchema);
