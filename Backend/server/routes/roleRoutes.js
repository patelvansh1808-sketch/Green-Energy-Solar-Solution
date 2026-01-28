const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  getAllUsers,
  updateUserRole,
  createStaffUser,
  getRoleStatistics,
  toggleUserStatus,
} = require("../controllers/roleController");

// All routes require admin access
router.use(auth, role("admin"));

// Get all users with filtering
router.get("/users", getAllUsers);

// Get role statistics
router.get("/statistics", getRoleStatistics);

// Create staff user
router.post("/staff", createStaffUser);

// Update user role
router.patch("/users/:id/role", updateUserRole);

// Toggle user active status
router.patch("/users/:id/toggle-status", toggleUserStatus);

module.exports = router;
