const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  connectionType: {
    type: String,
    enum: ["Residential", "Commercial"], // ✅ FIXED
    required: true,
  },

  location: { type: String },
  role: { type: String, default: "user" },
  googleId: { type: String, unique: true, sparse: true }, // For Google OAuth
});

module.exports = mongoose.model("User", userSchema);
