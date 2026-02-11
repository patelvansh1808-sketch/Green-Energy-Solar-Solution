import api from "./api";

// GET /api/financial/overview - Financial overview
export const getFinancialOverview = async (params = {}) => {
  const res = await api.get("/financial/overview", { params });
  return res.data;
};

// GET /api/financial/revenue-breakdown - Revenue breakdown
export const getRevenueBreakdown = async (params = {}) => {
  const res = await api.get("/financial/revenue-breakdown", { params });
  return res.data;
};

// GET /api/financial/installation-costs - Installation cost analysis
export const getInstallationCosts = async (params = {}) => {
  const res = await api.get("/financial/installation-costs", { params });
  return res.data;
};

// GET /api/financial/profit-margins - Profit margins
export const getProfitMargins = async () => {
  const res = await api.get("/financial/profit-margins");
  return res.data;
};

// GET /api/financial/roi-report - ROI report
export const getROIReport = async () => {
  const res = await api.get("/financial/roi-report");
  return res.data;
};
