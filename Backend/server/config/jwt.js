const jwt = require("jsonwebtoken");

const generateToken = (userId, role, email) => {
  return jwt.sign(
    { id: userId, role: role, email: email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = generateToken;
