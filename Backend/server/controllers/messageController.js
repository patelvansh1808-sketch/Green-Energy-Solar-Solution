const Message = require("../models/Message");
const { sendContactFormEmail } = require("../services/emailService");

/**
 * ================================
 * CREATE MESSAGE / TICKET
 * POST /api/messages
 * ================================
 */
exports.createMessage = async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        message: "Subject and message are required",
      });
    }

    const newMessage = await Message.create({
      userId: req.user.id,
      subject,
      message,
      category: category || "inquiry",
      priority: priority || "medium",
    });

    res.status(201).json({
      message: "Message created successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("CREATE MESSAGE ERROR:", error);
    res.status(500).json({
      message: "Failed to create message",
      error: error.message,
    });
  }
};

/**
 * ================================
 * GET USER'S MESSAGES
 * GET /api/messages
 * ================================
 */
exports.getUserMessages = async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    res.json(messages);
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

/**
 * ================================
 * GET SINGLE MESSAGE
 * GET /api/messages/:id
 * ================================
 */
exports.getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id).populate("userId", "name email");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Verify ownership
    if (message.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    res.json(message);
  } catch (error) {
    console.error("GET MESSAGE ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch message",
      error: error.message,
    });
  }
};

/**
 * ================================
 * ADD REPLY TO MESSAGE
 * POST /api/messages/:id/reply
 * ================================
 */
exports.addReply = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Reply message is required" });
    }

    const ticket = await Message.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Verify ownership
    if (ticket.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    ticket.replies.push({
      userId: req.user.id,
      message,
      isAdminReply: false,
    });

    ticket.lastReplyAt = new Date();
    await ticket.save();

    res.json({
      message: "Reply added successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("ADD REPLY ERROR:", error);
    res.status(500).json({
      message: "Failed to add reply",
      error: error.message,
    });
  }
};

/**
 * ================================
 * UPDATE MESSAGE STATUS
 * PATCH /api/messages/:id/status
 * ================================
 */
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["open", "in-progress", "resolved", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({
      message: "Status updated successfully",
      data: message,
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({
      message: "Failed to update status",
      error: error.message,
    });
  }
};

/**
 * ================================
 * PUBLIC CONTACT FORM SUBMISSION
 * POST /api/messages/contact/submit
 * ================================
 */
exports.contactFormSubmission = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Name, email, and message are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Send email to admin
    const emailSent = await sendContactFormEmail({
      name,
      email,
      message,
    });

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send your message. Please try again later.",
      });
    }

    res.status(200).json({
      message: "Your message has been sent successfully! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("CONTACT FORM SUBMISSION ERROR:", error);
    res.status(500).json({
      message: "Failed to submit contact form",
      error: error.message,
    });
  }
};
