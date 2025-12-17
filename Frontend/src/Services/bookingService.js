import api from "./api";

export const createBooking = async (data) => {
  const res = await api.post("/booking/create", data);
  return res.data;
};

export const getAllBookings = async () => {
  const res = await api.get("/booking/all");
  return res.data;
};

export const updateBookingStatus = async (id, status) => {
  const res = await api.put(`/booking/${id}`, { status });
  return res.data;
};
