// Simple RBAC configuration for in-house roles
const ROLES = {
  ADMIN: "admin",
  SALES: "sales",
  ENGINEER: "engineer",
  SUPPORT: "support",
};

// Permission map: permission -> allowed roles
const PERMISSIONS = {
  "admin:manage": [ROLES.ADMIN],
  "users:read": [ROLES.ADMIN, ROLES.SUPPORT],
  "users:update": [ROLES.ADMIN],
  "leads:read": [ROLES.ADMIN, ROLES.SALES, ROLES.ENGINEER, ROLES.SUPPORT],
  "leads:update": [ROLES.ADMIN, ROLES.SALES, ROLES.ENGINEER],
  "dashboard:view": [ROLES.ADMIN, ROLES.SALES, ROLES.ENGINEER, ROLES.SUPPORT],
};

const canAccess = (role, permission) => {
  const allowed = PERMISSIONS[permission] || [];
  return allowed.includes(role);
};

// Middleware by permission key
const requirePermission = (permission) => (req, res, next) => {
  const role = req.user?.role;
  if (!role || !canAccess(role, permission)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

// Convenience: require one of roles
const requireRole = (roles) => (req, res, next) => {
  const role = req.user?.role;
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!role || !allowed.includes(role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

module.exports = { ROLES, PERMISSIONS, canAccess, requirePermission, requireRole };