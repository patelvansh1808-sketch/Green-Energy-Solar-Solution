const express = require("express");
const router = express.Router();

const {
  createMessage,
  getUserMessages,
  getMessage,
  addReply,
  updateMessageStatus,
} = require("../controllers/messageController");

const authMiddleware = require("../middleware/authMiddleware");

// Create message/ticket
router.post("/", authMiddleware, createMessage);

// Get user's messages
router.get("/", authMiddleware, getUserMessages);

// Get single message
router.get("/:id", authMiddleware, getMessage);

// Add reply to message
router.post("/:id/reply", authMiddleware, addReply);

// Update message status
router.patch("/:id/status", authMiddleware, updateMessageStatus);

module.exports = router;
