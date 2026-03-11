const User = require("../models/User");
const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { generateToken, generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../config/jwt");
const { sendPasswordResetEmail } = require("../services/emailService");

const upsertCustomerProfile = async (user, profile) => {
  if (!user?._id) return;

  const fullName = (profile.fullName || user.name || "").trim();
  const phone = (profile.phone || user.phone || "").trim();
  const address = (profile.address || user.address || "").trim();
  const state = (profile.state || user.state || "").trim();
  const district = (profile.district || user.district || "").trim();
  const discom = (profile.discom || user.discom || "").trim();
  const city = (profile.city || user.city || user.location || "").trim();
  const pincode = (profile.pincode || user.pincode || "").trim();
  const systemCapacityKW = Number(profile.systemCapacityKW ?? user.systemCapacityKW ?? 0);

  // Ensure online-registered users are visible in admin customers even with partial profile data.
  if (!fullName) {
    return;
  }

  const safePhone = phone || "Not Provided";
  const safeAddress = address || "Not Provided";
  const safeCapacity = Number.isFinite(systemCapacityKW) ? systemCapacityKW : 0;

  await Customer.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        userId: user._id,
        fullName,
        phone: safePhone,
        address: safeAddress,
        city,
        state,
        district,
        discom,
        pincode,
        systemCapacityKW: safeCapacity,
        status: "Active",
      },
      $setOnInsert: {
        source: "online",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

/* =========================
   REGISTER USER
========================= */
exports.register = async (req, res) => {
  try {
    console.log('=== REGISTER REQUEST ===');
    console.log('req.body:', req.body);
    
    const {
      name,
      firstName,
      lastName,
      email,
      password,
      location,
      connectionType,
      phone,
      role,
      address,
      city,
      state,
      district,
      discom,
      pincode,
      systemCapacityKW,
    } = req.body;

    // Build full name from firstName/lastName or use name field
    const fullName = name || `${firstName} ${lastName}`.trim();
    
    console.log('Processed fullName:', fullName);
    console.log('Email:', email);
    console.log('Password exists:', !!password);
    console.log('ConnectionType:', connectionType);

    // Validation
    if (!fullName || !email || !password) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (!phone || !address || !state || !district || !discom || !systemCapacityKW) {
      return res.status(400).json({
        message: "Phone, address, state, district, DISCOM, and system capacity are required",
      });
    }

    // Check existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      firstName: firstName || fullName.split(' ')[0],
      lastName: lastName || fullName.split(' ').slice(1).join(' '),
      name: fullName,
      email,
      password: hashedPassword,
      location,
      connectionType: connectionType || 'Residential',
      phone,
      address,
      city,
      state,
      district,
      discom,
      pincode,
      systemCapacityKW: Number(systemCapacityKW),
      role: role || 'user',
    });

    console.log('User created successfully:', user.email);

    await upsertCustomerProfile(user, {
      fullName,
      phone,
      address,
      city: city || location || "",
      state,
      district,
      discom,
      pincode: pincode || "",
      systemCapacityKW,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role, user.email);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   LOGIN USER
========================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Repair missing customer profile automatically for users registered with full profile data.
    await upsertCustomerProfile(user, {});

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role, user.email);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   FORGOT PASSWORD
========================= */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    await sendPasswordResetEmail(email, user.name || "User", resetLink);

    res.json({
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   RESET PASSWORD
========================= */
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res.status(400).json({ message: "Email, token and new password are required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   REFRESH TOKEN
========================= */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    // Find user and verify stored refresh token
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id, user.role, user.email);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.error("REFRESH TOKEN ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};
