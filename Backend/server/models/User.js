const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  district: { type: String },
  discom: { type: String },
  pincode: { type: String },
  systemCapacityKW: { type: Number },

  connectionType: {
    type: String,
    enum: ["Residential", "Commercial", "Industrial"],
    required: true,
  },

  location: { type: String },
  
  // ===== ROLE-BASED ACCESS CONTROL (RBAC) =====
  role: { 
    type: String, 
    enum: ["user", "admin", "sales", "engineer", "technician", "support"],
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

  // Refresh token for JWT refresh logic
  refreshToken: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
