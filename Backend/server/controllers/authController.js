const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../config/jwt");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, location, connectionType } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      location,
      connectionType,
    });

    res.status(201).json({
      token: generateToken(user._id, user.role),
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(user._id, user.role),
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "Email not registered" });
  }

  // Mock reset logic (no real email)
  res.json({
    message: "Password reset link sent to your email (demo)",
  });
};