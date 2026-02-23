import api from "./api";

const maintenanceService = {
  getSummary: async () => {
    const res = await api.get("/maintenance/summary");
    return res.data;
  },

  getPricingSettings: async () => {
    const res = await api.get("/maintenance/settings/pricing");
    return res.data;
  },

  createPaymentOrder: async (planType) => {
    const res = await api.post("/maintenance/payments/create-order", { planType });
    return res.data;
  },

  verifyPaymentAndCreatePlan: async (payload) => {
    const res = await api.post("/maintenance/payments/verify", payload);
    return res.data;
  },

  createPlan: async (data) => {
    const res = await api.post("/maintenance/plans", data);
    return res.data;
  },

  getPlans: async () => {
    const res = await api.get("/maintenance/plans");
    return res.data;
  },

  updatePlan: async (id, data) => {
    const res = await api.patch(`/maintenance/plans/${id}`, data);
    return res.data;
  },

  cancelPlan: async (id) => {
    const res = await api.delete(`/maintenance/plans/${id}`);
    return res.data;
  },

  createService: async (data) => {
    const res = await api.post("/maintenance/services", data);
    return res.data;
  },

  getUpcomingServices: async () => {
    const res = await api.get("/maintenance/services/upcoming");
    return res.data;
  },

  getServiceHistory: async () => {
    const res = await api.get("/maintenance/services/history");
    return res.data;
  },

  getAssignedServicesForStaff: async () => {
    const res = await api.get("/maintenance/services/assigned-to-me");
    return res.data;
  },

  getReports: async () => {
    const res = await api.get("/maintenance/reports");
    return res.data;
  },

  uploadReport: async (formData) => {
    const res = await api.post("/maintenance/reports/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  updateService: async (id, data) => {
    const res = await api.patch(`/maintenance/services/${id}`, data);
    return res.data;
  },

  updateServiceExecution: async (id, data) => {
    const res = await api.patch(`/maintenance/services/${id}/execution`, data);
    return res.data;
  },

  uploadServiceExecutionPhotos: async (id, formData) => {
    const res = await api.post(`/maintenance/services/${id}/execution-photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

export default maintenanceService;
