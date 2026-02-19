const User = require("../models/User");

/* =====================================================
   GET ALL USERS WITH ROLE FILTERING
   GET /api/roles/users
===================================================== */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search } = req.query;
    
    let query = {};
    
    // Filter by role
    if (role && role !== "all") {
      if (role === "staff") {
        // Staff includes: admin, sales, engineer, technician, support (NOT user/customer)
        query.role = { $in: ["admin", "sales", "engineer", "technician", "support"] };
      } else {
        query.role = role;
      }
    } else {
      // Default: show only staff, not regular users
      query.role = { $in: ["admin", "sales", "engineer", "technician", "support"] };
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }
    
    const users = await User.find(query)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

/* =====================================================
   UPDATE USER ROLE
   PATCH /api/roles/users/:id/role
===================================================== */
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, department, isActive } = req.body;
    
    // Validate role
    const validRoles = ["user", "admin", "sales", "engineer", "technician", "support"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }
    
    // Prevent self-demotion (admin removing their own admin role)
    if (id === req.user.id && role && role !== "admin") {
      return res.status(400).json({ message: "Cannot change your own admin role" });
    }
    
    const updates = {};
    if (role) updates.role = role;
    if (department !== undefined) updates.department = department;
    if (isActive !== undefined) updates.isActive = isActive;
    
    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error("UPDATE ROLE ERROR:", error);
    res.status(500).json({ message: "Failed to update user role", error: error.message });
  }
};

/* =====================================================
   CREATE STAFF USER
   POST /api/roles/staff
===================================================== */
exports.createStaffUser = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      role, 
      department,
      phone,
      location 
    } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ 
        message: "First name, last name, email, password, and role are required" 
      });
    }
    
    // Validate role (staff only)
    const staffRoles = ["admin", "sales", "engineer", "technician", "support"];
    if (!staffRoles.includes(role)) {
      return res.status(400).json({ 
        message: "Invalid staff role. Must be admin, sales, engineer, technician, or support" 
      });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    
    // Create staff user
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      role,
      department: department || role.charAt(0).toUpperCase() + role.slice(1),
      phone: phone || "",
      location: location || "",
      connectionType: "Commercial", // Staff users default to commercial
      isActive: true,
      hireDate: new Date(),
    });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      message: "Staff user created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("CREATE STAFF ERROR:", error);
    res.status(500).json({ message: "Failed to create staff user", error: error.message });
  }
};

/* =====================================================
   GET ROLE STATISTICS
   GET /api/roles/statistics
===================================================== */
exports.getRoleStatistics = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
          },
        },
      },
    ]);
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    
    res.json({
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      byRole: stats,
    });
  } catch (error) {
    console.error("GET STATS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch statistics", error: error.message });
  }
};

/* =====================================================
   TOGGLE USER ACTIVE STATUS
   PATCH /api/roles/users/:id/toggle-status
===================================================== */
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent self-deactivation
    if (id === req.user.id) {
      return res.status(400).json({ message: "Cannot deactivate your own account" });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("TOGGLE STATUS ERROR:", error);
    res.status(500).json({ message: "Failed to toggle user status", error: error.message });
  }
};
