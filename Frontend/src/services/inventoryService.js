import api from "./api";

const inventoryService = {
  getStats: async () => {
    const res = await api.get("/inventory/stats");
    return res.data;
  },

  getItems: async (params = {}) => {
    const res = await api.get("/inventory", { params });
    return res.data;
  },

  createItem: async (data) => {
    const res = await api.post("/inventory", data);
    return res.data;
  },

  updateItem: async (id, data) => {
    const res = await api.patch(`/inventory/${id}`, data);
    return res.data;
  },

  deleteItem: async (id) => {
    const res = await api.delete(`/inventory/${id}`);
    return res.data;
  },

  adjustStock: async (id, data) => {
    const res = await api.post(`/inventory/${id}/adjust`, data);
    return res.data;
  },

  getMovements: async (params = {}) => {
    const res = await api.get("/inventory/movements", { params });
    return res.data;
  },
};

export default inventoryService;