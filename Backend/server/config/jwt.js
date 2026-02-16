const jwt = require("jsonwebtoken");

// Generate Access Token (short-lived)
const generateAccessToken = (userId, role, email) => {
  return jwt.sign(
    { id: userId, role: role, email: email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // 15 minutes
  );
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "7d" } // 7 days
  );
};

// Legacy function for backward compatibility
const generateToken = (userId, role, email) => {
  return generateAccessToken(userId, role, email);
};

// Verify Access Token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Verify Refresh Token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
