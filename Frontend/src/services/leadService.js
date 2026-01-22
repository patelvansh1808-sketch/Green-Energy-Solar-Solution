import api from './api';

const API_BASE = '/leads';

/**
 * Create a new lead
 */
export const createLead = async (leadData) => {
  return api.post(API_BASE, leadData);
};

/**
 * Get all leads with filters
 */
export const getAllLeads = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  return api.get(`${API_BASE}?${params}`);
};

/**
 * Get lead by ID
 */
export const getLeadById = async (id) => {
  return api.get(`${API_BASE}/${id}`);
};

/**
 * Update lead
 */
export const updateLead = async (id, leadData) => {
  return api.put(`${API_BASE}/${id}`, leadData);
};

/**
 * Update lead stage
 */
export const updateLeadStage = async (id, stage, reason = '') => {
  return api.put(`${API_BASE}/${id}/stage`, { stage, reason });
};

/**
 * Assign sales engineer to lead
 */
export const assignSalesEngineer = async (id, salesEngineerId) => {
  return api.put(`${API_BASE}/${id}/assign`, { salesEngineerId });
};

/**
 * Add communication to lead
 */
export const addCommunication = async (id, type, notes) => {
  return api.post(`${API_BASE}/${id}/communications`, { type, notes });
};

/**
 * Schedule follow-up
 */
export const scheduleFollowUp = async (id, followUpDate, followUpType, notes = '') => {
  return api.post(`${API_BASE}/${id}/follow-up`, {
    followUpDate,
    followUpType,
    notes
  });
};

/**
 * Create quote for lead
 */
export const createQuote = async (id, quoteData) => {
  return api.post(`${API_BASE}/${id}/quote`, quoteData);
};

/**
 * Convert lead to customer
 */
export const convertToCustomer = async (id, customerId, conversionNotes = '') => {
  return api.post(`${API_BASE}/${id}/convert`, { customerId, conversionNotes });
};

/**
 * Mark lead as lost
 */
export const markAsLost = async (id, reason, notes = '') => {
  return api.put(`${API_BASE}/${id}/lost`, { reason, notes });
};

/**
 * Get lead analytics
 */
export const getLeadAnalytics = async (startDate = null, endDate = null) => {
  let url = `${API_BASE}/analytics/dashboard`;
  if (startDate || endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    url += `?${params}`;
  }
  return api.get(url);
};

/**
 * Get pending follow-ups
 */
export const getFollowUpPending = async () => {
  return api.get(`${API_BASE}/follow-up/pending`);
};

/**
 * Delete lead
 */
export const deleteLead = async (id) => {
  return api.delete(`${API_BASE}/${id}`);
};

/**
 * Get team members
 */
export const getTeamMembers = async () => {
  return api.get('/users/team-members');
};

const leadServiceDefault = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  updateLeadStage,
  assignSalesEngineer,
  addCommunication,
  scheduleFollowUp,
  createQuote,
  convertToCustomer,
  markAsLost,
  getLeadAnalytics,
  getFollowUpPending,
  deleteLead,
  getTeamMembers
};

export default leadServiceDefault;
