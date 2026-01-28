const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Create ticket (customer or admin)
router.post("/", authMiddleware, ticketController.createTicket);

// Get all tickets (admin/support can see all, customer sees only theirs)
router.get("/", authMiddleware, ticketController.getAllTickets);

// Get ticket statistics (admin only)
router.get(
  "/stats/overview",
  authMiddleware,
  roleMiddleware(["admin", "support"]),
  ticketController.getTicketStats
);

// Get single ticket
router.get("/:id", authMiddleware, ticketController.getTicketById);

// Update ticket status (admin/support only)
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["admin", "support"]),
  ticketController.updateTicketStatus
);

// Assign ticket (admin/support only)
router.patch(
  "/:id/assign",
  authMiddleware,
  roleMiddleware(["admin", "support"]),
  ticketController.assignTicket
);

// Add response
router.post("/:id/response", authMiddleware, ticketController.addResponse);

// Resolve ticket (admin/support only)
router.patch(
  "/:id/resolve",
  authMiddleware,
  roleMiddleware(["admin", "support"]),
  ticketController.resolveTicket
);

// Close ticket with feedback (customer or admin)
router.patch("/:id/close", authMiddleware, ticketController.closeTicket);

// Delete ticket (admin/support only)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "support"]),
  ticketController.deleteTicket
);

module.exports = router;
