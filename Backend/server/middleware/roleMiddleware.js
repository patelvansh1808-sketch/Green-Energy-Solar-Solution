/* =====================================================
   ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
   
   Roles Hierarchy:
   - admin: Full system access
   - sales: Customer management, bookings, quotes
   - engineer: Installation, technical tasks, service
   - support: Customer support, tickets, queries
   - user: End customer
===================================================== */

// Check if user has required role
const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Admin has access to everything
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user has the required role
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(req.user.role)) {
        return res.status(403).json({ 
          message: "Access denied. Insufficient permissions.",
          requiredRole,
          userRole: req.user.role
        });
      }
    } else {
      if (req.user.role !== requiredRole) {
        return res.status(403).json({ 
          message: "Access denied. Insufficient permissions.",
          requiredRole,
          userRole: req.user.role
        });
      }
    }

    next();
  };
};

// Check if user is internal staff (admin, sales, engineer, technician, support)
const isStaff = (req, res, next) => {
  const staffRoles = ["admin", "sales", "engineer", "technician", "support"];
  
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!staffRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      message: "Access denied. Staff access only.",
      userRole: req.user.role
    });
  }

  next();
};

// Permission-based access control
const hasPermission = (permission) => {
  const permissions = {
    // User Management
    "users.view": ["admin"],
    "users.create": ["admin"],
    "users.edit": ["admin"],
    "users.delete": ["admin"],
    
    // Customer Management
    "customers.view": ["admin", "sales", "support"],
    "customers.create": ["admin", "sales"],
    "customers.edit": ["admin", "sales"],
    "customers.delete": ["admin"],
    
    // Booking Management
    "bookings.view": ["admin", "sales", "engineer", "technician"],
    "bookings.create": ["admin", "sales"],
    "bookings.edit": ["admin", "sales", "engineer", "technician"],
    "bookings.delete": ["admin"],
    "bookings.assign": ["admin", "sales"],
    
    // Installation & Technical
    "installations.view": ["admin", "engineer", "technician", "sales"],
    "installations.manage": ["admin", "engineer", "technician"],
    
    // Support & Tickets
    "support.view": ["admin", "support", "sales"],
    "support.manage": ["admin", "support"],
    
    // Analytics & Reports
    "analytics.view": ["admin", "sales"],
    "reports.generate": ["admin", "sales", "engineer", "technician"],
    
    // System Settings
    "settings.view": ["admin"],
    "settings.edit": ["admin"],
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const allowedRoles = permissions[permission] || [];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Permission '${permission}' required.`,
        userRole: req.user.role
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
module.exports.isStaff = isStaff;
module.exports.hasPermission = hasPermission;
