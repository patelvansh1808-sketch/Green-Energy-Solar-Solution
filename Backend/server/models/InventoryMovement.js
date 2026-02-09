const mongoose = require("mongoose");

const inventoryMovementSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },
    type: {
      type: String,
      enum: ["in", "out", "adjust", "reserve", "release"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    reason: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    referenceType: {
      type: String,
      enum: ["booking", "project", "maintenance", "other"],
      default: "other",
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    beforeStock: Number,
    afterStock: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryMovement", inventoryMovementSchema);