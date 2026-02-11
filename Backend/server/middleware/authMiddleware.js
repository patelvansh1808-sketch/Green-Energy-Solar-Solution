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
    if (error.name === "TokenExpiredError") {
      console.error("JWT ERROR: jwt expired");
      return res.status(401).json({ 
        message: "Token expired", 
        code: "TOKEN_EXPIRED"
      });
    }
    if (error.name === "JsonWebTokenError") {
      console.error("JWT ERROR: jwt malformed - Token:", token?.substring(0, 20) + "...");
      return res.status(401).json({ 
        message: "Invalid token format", 
        code: "INVALID_TOKEN"
      });
    }
    console.error("JWT ERROR:", error.message);
    return res.status(401).json({ message: "Token invalid" });
  }
};

module.exports = authMiddleware;
