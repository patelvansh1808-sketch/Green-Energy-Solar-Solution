const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getUnreadCount,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

// Get all notifications
router.get("/", authMiddleware, getNotifications);

// Get unread count
router.get("/count/unread", authMiddleware, getUnreadCount);

// Mark single notification as read
router.patch("/:id/read", authMiddleware, markAsRead);

// Mark all as read
router.patch("/read-all", authMiddleware, markAllAsRead);

// Delete notification
router.delete("/:id", authMiddleware, deleteNotification);

// Create notification (admin only)
router.post("/", authMiddleware, createNotification);

module.exports = router;
