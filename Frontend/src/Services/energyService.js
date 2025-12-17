import api from "./api";

export const getEnergyData = async () => {
  const res = await api.get("/solar/all");
  return res.data;
};

export const addEnergyData = async (data) => {
  const res = await api.post("/solar/add", data);
  return res.data;
};

export const getEnergyStats = async () => {
  const res = await api.get("/solar/stats");
  return res.data;
};
