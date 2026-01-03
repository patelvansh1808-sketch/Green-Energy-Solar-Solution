import api from "./api";

export const getEnergyData = async () => {
  const res = await api.get("/energy/my");
  return res.data;
};

export const addEnergyData = async (data) => {
  const res = await api.post("/energy/add", data);
  return res.data;
};

export const getEnergyStats = async () => {
  const res = await api.post("/energy/generate-sample");
  return res.data;
};
