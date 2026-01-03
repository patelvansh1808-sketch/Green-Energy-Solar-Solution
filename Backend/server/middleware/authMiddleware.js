const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Normalize user object - support both id, _id, and userId
    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("JWT ERROR:", error.message);
    return res.status(401).json({ message: "Token invalid" });
  }
};

module.exports = authMiddleware;
