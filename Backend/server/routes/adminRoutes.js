const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  getAllUsers,
  getAllBookings,
  getAdminStats
} = require("../controllers/adminController");

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Admin only
 */
router.get("/stats", auth, role("admin"), getAdminStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get("/users", auth, role("admin"), getAllUsers);

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all bookings
 * @access  Admin only
 */
router.get("/bookings", auth, role("admin"), getAllBookings);

module.exports = router;
