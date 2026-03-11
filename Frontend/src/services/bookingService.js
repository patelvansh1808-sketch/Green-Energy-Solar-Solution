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

  createBookingPaymentOrder: async (bookingId, options = {}) => {
    const res = await api.post(`/bookings/${bookingId}/payment/create-order`, options);
    return res.data;
  },

  verifyBookingPayment: async (bookingId, payload) => {
    const res = await api.post(`/bookings/${bookingId}/payment/verify`, payload);
    return res.data;
  },

  createFinalPaymentOrder: async (bookingId, options = {}) => {
    const res = await api.post(`/bookings/${bookingId}/payment/create-final-order`, options);
    return res.data;
  },

  verifyFinalPayment: async (bookingId, payload) => {
    const res = await api.post(`/bookings/${bookingId}/payment/verify-final`, payload);
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

  requestRemainingPayment: async (id, data = {}) => {
    const res = await api.post(`/admin/bookings/${id}/request-remaining-payment`, data);
    return res.data;
  },

  deleteBooking: async (id) => {
    const res = await api.delete(`/bookings/${id}`);
    return res.data;
  },
};

export default bookingService;
