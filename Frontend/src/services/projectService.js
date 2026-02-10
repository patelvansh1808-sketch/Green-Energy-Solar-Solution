import api from "./api";

const projectService = {
  // Get available bookings for project creation
  getAvailableBookings: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    
    const res = await api.get(`/projects/bookings/available?${params.toString()}`);
    return res.data;
  },

  // Get booking details
  getBookingDetails: async (bookingId) => {
    const res = await api.get(`/projects/booking/${bookingId}`);
    return res.data;
  },

  // Create project from booking
  createProjectFromBooking: async (bookingId, data) => {
    const res = await api.post(`/projects/from-booking/${bookingId}`, data);
    return res.data;
  },

  // Get all projects with filtering
  getAllProjects: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.engineerId) params.append("engineerId", filters.engineerId);
    if (filters.projectManagerId) params.append("projectManagerId", filters.projectManagerId);
    if (filters.customerId) params.append("customerId", filters.customerId);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.search) params.append("search", filters.search);

    const res = await api.get(`/projects?${params.toString()}`);
    return res.data;
  },

  // Get single project by ID
  getProjectById: async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },

  // Create new project
  createProject: async (data) => {
    const res = await api.post("/projects", data);
    return res.data;
  },

  // Update site survey
  updateSiteSurvey: async (id, data) => {
    const res = await api.patch(`/projects/${id}/survey`, data);
    return res.data;
  },

  // Assign engineer to project
  assignEngineer: async (id, data) => {
    const res = await api.patch(`/projects/${id}/assign-engineer`, data);
    return res.data;
  },

  // Update installation details
  updateInstallation: async (id, data) => {
    const res = await api.patch(`/projects/${id}/installation`, data);
    return res.data;
  },

  // Update inventory selection
  updateInventorySelection: async (id, data) => {
    const res = await api.patch(`/projects/${id}/inventory`, data);
    return res.data;
  },

  // Update testing & commissioning
  updateTesting: async (id, data) => {
    const res = await api.patch(`/projects/${id}/testing`, data);
    return res.data;
  },

  // Go-live confirmation
  goLiveConfirmation: async (id, data) => {
    const res = await api.patch(`/projects/${id}/go-live`, data);
    return res.data;
  },

  // Complete project
  completeProject: async (id, data) => {
    const res = await api.patch(`/projects/${id}/complete`, data);
    return res.data;
  },

  // Update project status
  updateProjectStatus: async (id, status) => {
    const res = await api.patch(`/projects/${id}/status`, { status });
    return res.data;
  },

  // Add note to project
  addNote: async (id, content) => {
    const res = await api.post(`/projects/${id}/notes`, { content });
    return res.data;
  },

  // Get project statistics
  getProjectStats: async () => {
    const res = await api.get("/projects/stats/overview");
    return res.data;
  },

  // Delete project
  deleteProject: async (id) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
};

export default projectService;
