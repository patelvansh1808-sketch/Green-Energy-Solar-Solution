import api from "./api";

export const createBooking = async (data) => {
  const res = await api.post("/bookings/create", data);
  return res.data;
};

export const getMyBookings = async () => {
  const res = await api.get("/bookings/my");
  return res.data;
};
