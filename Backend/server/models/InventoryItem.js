const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["panel", "inverter", "meter", "spare"],
      required: true,
    },
    unit: {
      type: String,
      default: "pcs",
    },
    brand: String,
    model: String,
    capacity: String,
    location: String,
    supplier: String,
    costPrice: {
      type: Number,
      default: 0,
    },
    sellingPrice: {
      type: Number,
      default: 0,
    },
    minStock: {
      type: Number,
      default: 0,
    },
    stockOnHand: {
      type: Number,
      default: 0,
    },
    reservedStock: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);