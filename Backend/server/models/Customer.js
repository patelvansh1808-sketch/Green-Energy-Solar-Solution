const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one customer per user
    },

    // Customer Profile
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },

    // Location & Site Details
    address: {
      type: String,
      required: true,
    },
    city: String,
    state: String,
    pincode: String,

    // Solar System Details
    systemCapacityKW: {
      type: Number,
      required: true,
    },
    installationDate: Date,

    // CRM Status
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
