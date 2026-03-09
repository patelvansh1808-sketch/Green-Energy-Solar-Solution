import api from "./api";

const subsidyApplicationService = {
  // Get customer's subsidy application
  getMySubsidyApplication: async () => {
    try {
      const response = await api.get("/subsidy-applications/my-application");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new subsidy application with documents
  createSubsidyApplication: async (formData) => {
    try {
      const response = await api.post("/subsidy-applications", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Get all subsidy applications
  getAllSubsidyApplications: async () => {
    try {
      const response = await api.get("/subsidy-applications");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Get specific application by ID
  getSubsidyApplicationById: async (id) => {
    try {
      const response = await api.get(`/subsidy-applications/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: Update application status and details
  updateSubsidyApplication: async (id, updateData) => {
    try {
      const response = await api.patch(`/subsidy-applications/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Download document file
  downloadDocument: async (filePath) => {
    try {
      const response = await api.get(`/subsidy-applications/download/${encodeURIComponent(filePath)}`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default subsidyApplicationService;
