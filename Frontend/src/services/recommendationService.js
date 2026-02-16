import api from "./api";

export const getSmartRecommendations = async (availableFunding = 0) => {
  const res = await api.get(`/recommendations/smart?funding=${availableFunding}`);
  return res.data.recommendations;
};
