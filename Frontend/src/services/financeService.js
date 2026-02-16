import api from "./api";

const financeService = {
  getOverview: async (params = {}) => {
    const res = await api.get("/finance/overview", { params });
    return res.data;
  },

  getRevenueReport: async (params = {}) => {
    const res = await api.get("/finance/reports/revenue", { params });
    return res.data;
  },

  getProfitability: async (params = {}) => {
    const res = await api.get("/finance/bookings/profit", { params });
    return res.data;
  },

  getCompanyRoi: async (params = {}) => {
    const res = await api.get("/finance/roi/company", { params });
    return res.data;
  },

  getInstallationCostAnalysis: async (params = {}) => {
    const res = await api.get("/finance/costs/installation", { params });
    return res.data;
  },

  updateBookingCosts: async (bookingId, data) => {
    const res = await api.patch(`/finance/bookings/${bookingId}/costs`, data);
    return res.data;
  },
};

export default financeService;
