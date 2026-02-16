const Ticket = require("../models/Ticket");
const Customer = require("../models/Customer");
const User = require("../models/User");
const emailService = require("../services/emailService");

/* =====================================================
   CREATE NEW TICKET
   POST /api/tickets
===================================================== */
exports.createTicket = async (req, res) => {
  try {
    const {
      customerId,
      projectId,
      subject,
      category,
      priority,
      description,
      attachments,
    } = req.body;

    // Get customer details
    const customer = await Customer.findById(customerId).populate('userId');
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Get email from user
    const userEmail = customer.userId?.email || 'noemail@example.com';

    const newTicket = new Ticket({
      customerId,
      customerName: customer.fullName,
      customerEmail: userEmail,
      customerPhone: customer.phone,
      projectId,
      subject,
      category: category || "general",
      priority: priority || "medium",
      description,
      attachments,
      status: "open",
    });

    await newTicket.save();

    // Send email notification for all tickets
    try {
      console.log(`📧 Sending ticket notification email for category: ${category}...`);
      await emailService.sendTicketNotificationEmail({
        ticketId: newTicket._id,
        customerName: customer.fullName,
        customerEmail: userEmail,
        category: category,
        subject: subject || newTicket.subject,
        description: description,
        priority: priority || "medium",
      });
      console.log("✅ Ticket notification email sent successfully");
    } catch (emailError) {
      console.error("❌ Failed to send ticket notification email:", emailError);
      console.error("Error details:", emailError.message);
      // Don't fail the ticket creation if email fails
    }

    console.log(`✅ Ticket created: ${newTicket._id} | Category: ${category} | Customer: ${customer.fullName}`);

    res.status(201).json({
      message: "Ticket created successfully!",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("CREATE TICKET ERROR:", error);
    res.status(500).json({
      message: "Failed to create ticket",
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
};

/* =====================================================
   GET ALL TICKETS (WITH FILTERS)
   GET /api/tickets
===================================================== */
exports.getAllTickets = async (req, res) => {
  try {
    const { status, category, priority, customerId, assignedTo, search } =
      req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (customerId) query.customerId = customerId;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { ticketNumber: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
      ];
    }

    const tickets = await Ticket.find(query)
      .populate("customerId", "name email phone")
      .populate("assignedTo", "firstName lastName email")
      .populate("projectId", "projectName status")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error("GET TICKETS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

/* =====================================================
   GET TICKET BY ID
   GET /api/tickets/:id
===================================================== */
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id)
      .populate("customerId", "name email phone")
      .populate("assignedTo", "firstName lastName email")
      .populate("projectId", "projectName status")
      .populate("responses.respondedBy", "firstName lastName email");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("GET TICKET ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch ticket",
      error: error.message,
    });
  }
};

/* =====================================================
   UPDATE TICKET STATUS
   PATCH /api/tickets/:id/status
===================================================== */
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({
      message: "Failed to update status",
      error: error.message,
    });
  }
};

/* =====================================================
   ASSIGN TICKET
   PATCH /api/tickets/:id/assign
===================================================== */
exports.assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      {
        $set: {
          assignedTo,
          assignedToName: `${user.firstName} ${user.lastName}`,
          status: "in_progress",
        },
      },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("ASSIGN TICKET ERROR:", error);
    res.status(500).json({
      message: "Failed to assign ticket",
      error: error.message,
    });
  }
};

/* =====================================================
   ADD RESPONSE TO TICKET
   POST /api/tickets/:id/response
===================================================== */
exports.addResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, isCustomerResponse, attachments } = req.body;

    const user = req.user.id ? await User.findById(req.user.id) : null;

    const response = {
      respondedBy: isCustomerResponse ? null : req.user.id,
      responderName: isCustomerResponse
        ? "Customer"
        : user
        ? `${user.firstName} ${user.lastName}`
        : "Support",
      responderRole: isCustomerResponse ? "customer" : user?.role || "support",
      message,
      isCustomerResponse: !!isCustomerResponse,
      timestamp: new Date(),
      attachments: attachments || [],
    };

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      {
        $push: { responses: response },
        $set: { status: isCustomerResponse ? "pending" : "in_progress" },
      },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("ADD RESPONSE ERROR:", error);
    res.status(500).json({
      message: "Failed to add response",
      error: error.message,
    });
  }
};

/* =====================================================
   RESOLVE TICKET
   PATCH /api/tickets/:id/resolve
===================================================== */
exports.resolveTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    const user = await User.findById(req.user.id);

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "resolved",
          "resolution.resolvedBy": req.user.id,
          "resolution.resolverName": user
            ? `${user.firstName} ${user.lastName}`
            : "Support",
          "resolution.resolutionDate": new Date(),
          "resolution.resolutionNotes": resolutionNotes,
        },
      },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("RESOLVE TICKET ERROR:", error);
    res.status(500).json({
      message: "Failed to resolve ticket",
      error: error.message,
    });
  }
};

/* =====================================================
   CLOSE TICKET WITH FEEDBACK
   PATCH /api/tickets/:id/close
===================================================== */
exports.closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerSatisfaction, customerFeedback } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "closed",
          "resolution.customerSatisfaction": customerSatisfaction,
          "resolution.customerFeedback": customerFeedback,
        },
      },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("CLOSE TICKET ERROR:", error);
    res.status(500).json({
      message: "Failed to close ticket",
      error: error.message,
    });
  }
};

/* =====================================================
   DELETE TICKET
   DELETE /api/tickets/:id
===================================================== */
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("DELETE TICKET ERROR:", error);
    res.status(500).json({ message: "Failed to delete ticket", error: error.message });
  }
};

/* =====================================================
   GET TICKET STATISTICS
   GET /api/tickets/stats/overview
===================================================== */
exports.getTicketStats = async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: "open" });
    const inProgress = await Ticket.countDocuments({ status: "in_progress" });
    const resolved = await Ticket.countDocuments({ status: "resolved" });
    const closed = await Ticket.countDocuments({ status: "closed" });

    const byCategory = await Ticket.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const byPriority = await Ticket.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    res.json({
      total,
      open,
      inProgress,
      resolved,
      closed,
      byCategory,
      byPriority,
    });
  } catch (error) {
    console.error("STATS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};
