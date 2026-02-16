import api from "./api";

const roleService = {
  // Get all users with filtering
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append("role", filters.role);
    if (filters.isActive !== undefined) params.append("isActive", filters.isActive);
    if (filters.search) params.append("search", filters.search);
    
    const url = `/roles/users?${params.toString()}`;
    console.log("🔥 Fetching users from:", url);
    const res = await api.get(url);
    console.log("🔥 Users response:", res.data);
    return res.data;
  },

  // Get role statistics
  getStatistics: async () => {
    const res = await api.get("/roles/statistics");
    return res.data;
  },

  // Create staff user
  createStaffUser: async (data) => {
    const res = await api.post("/roles/staff", data);
    return res.data;
  },

  // Update user role
  updateUserRole: async (userId, data) => {
    const res = await api.patch(`/roles/users/${userId}/role`, data);
    return res.data;
  },

  // Toggle user status
  toggleUserStatus: async (userId) => {
    const res = await api.patch(`/roles/users/${userId}/toggle-status`);
    return res.data;
  },
};

export default roleService;
