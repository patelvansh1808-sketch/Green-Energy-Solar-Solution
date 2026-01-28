const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },

  connectionType: {
    type: String,
    enum: ["Residential", "Commercial"], // ✅ FIXED
    required: true,
  },

  location: { type: String },
  
  // ===== ROLE-BASED ACCESS CONTROL (RBAC) =====
  role: { 
    type: String, 
    enum: ["user", "admin", "sales", "engineer", "support"],
    default: "user" 
  },
  
  // Additional role metadata
  department: { type: String },
  isActive: { type: Boolean, default: true },
  hireDate: { type: Date },
  
  googleId: { type: String, unique: true, sparse: true }, // For Google OAuth

  // Password reset
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
