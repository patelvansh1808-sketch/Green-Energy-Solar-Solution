const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
      role: decoded.role,
    };
  } catch (error) {
    req.user = null;
  }

  return next();
};

module.exports = optionalAuth;
