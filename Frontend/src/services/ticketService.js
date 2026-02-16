import api from "./api";

const ticketService = {
  // Create new ticket
  createTicket: async (data) => {
    const res = await api.post("/tickets", data);
    return res.data;
  },

  // Get all tickets with filters
  getAllTickets: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.category) params.append("category", filters.category);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.customerId) params.append("customerId", filters.customerId);
    if (filters.assignedTo) params.append("assignedTo", filters.assignedTo);
    if (filters.search) params.append("search", filters.search);

    const res = await api.get(`/tickets?${params.toString()}`);
    return res.data;
  },

  // Get single ticket
  getTicketById: async (id) => {
    const res = await api.get(`/tickets/${id}`);
    return res.data;
  },

  // Update ticket status
  updateStatus: async (id, status) => {
    const res = await api.patch(`/tickets/${id}/status`, { status });
    return res.data;
  },

  // Assign ticket
  assignTicket: async (id, assignedTo) => {
    const res = await api.patch(`/tickets/${id}/assign`, { assignedTo });
    return res.data;
  },

  // Add response
  addResponse: async (id, message, isCustomerResponse = false, attachments = []) => {
    const res = await api.post(`/tickets/${id}/response`, {
      message,
      isCustomerResponse,
      attachments,
    });
    return res.data;
  },

  // Resolve ticket
  resolveTicket: async (id, resolutionNotes) => {
    const res = await api.patch(`/tickets/${id}/resolve`, { resolutionNotes });
    return res.data;
  },

  // Close ticket with feedback
  closeTicket: async (id, customerSatisfaction, customerFeedback) => {
    const res = await api.patch(`/tickets/${id}/close`, {
      customerSatisfaction,
      customerFeedback,
    });
    return res.data;
  },

  // Get ticket statistics
  getStats: async () => {
    const res = await api.get("/tickets/stats/overview");
    return res.data;
  },

  deleteTicket: async (id) => {
    const res = await api.delete(`/tickets/${id}`);
    return res.data;
  },
};

export default ticketService;
