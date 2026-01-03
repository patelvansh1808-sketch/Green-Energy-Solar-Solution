const Notification = require("../models/Notification");

/**
 * ================================
 * GET ALL NOTIFICATIONS FOR USER
 * GET /api/notifications
 * ================================
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

/**
 * ================================
 * MARK NOTIFICATION AS READ
 * PATCH /api/notifications/:id/read
 * ================================
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("MARK READ ERROR:", error);
    res.status(500).json({
      message: "Failed to update notification",
      error: error.message,
    });
  }
};

/**
 * ================================
 * MARK ALL AS READ
 * PATCH /api/notifications/read-all
 * ================================
 */
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);
    res.status(500).json({
      message: "Failed to update notifications",
      error: error.message,
    });
  }
};

/**
 * ================================
 * DELETE NOTIFICATION
 * DELETE /api/notifications/:id
 * ================================
 */
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);
    res.status(500).json({
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

/**
 * ================================
 * CREATE NOTIFICATION (ADMIN/INTERNAL)
 * POST /api/notifications
 * ================================
 */
exports.createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, actionUrl, icon, priority, relatedId } =
      req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        message: "Missing required fields: userId, title, message",
      });
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      actionUrl,
      icon,
      priority,
      relatedId,
    });

    res.status(201).json({
      message: "Notification created",
      notification,
    });
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);
    res.status(500).json({
      message: "Failed to create notification",
      error: error.message,
    });
  }
};

/**
 * ================================
 * GET UNREAD COUNT
 * GET /api/notifications/count/unread
 * ================================
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error("UNREAD COUNT ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch unread count",
      error: error.message,
    });
  }
};
