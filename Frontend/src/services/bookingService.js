import api from "./api";

const bookingService = {
  generateQuotation: async (data) => {
    const res = await api.post("/bookings/quotation", data);
    return res.data;
  },

  createBooking: async (data) => {
    const res = await api.post("/bookings/create", data);
    return res.data;
  },

  getMyBookings: async () => {
    const res = await api.get("/bookings/my");
    return res.data;
  },

  getBookingStatus: async (id) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  getAllBookings: async () => {
    const res = await api.get("/admin/bookings");
    return res.data;
  },

  updateBookingStatus: async (id, data) => {
    const res = await api.patch(`/admin/bookings/${id}`, data);
    return res.data;
  },

  deleteBooking: async (id) => {
    const res = await api.delete(`/bookings/${id}`);
    return res.data;
  },
};

export default bookingService;
