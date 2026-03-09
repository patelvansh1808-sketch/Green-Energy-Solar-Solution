import api from "./api";

const getMyActivity = async (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();
  const endpoint = queryString
    ? `/activity/my-history?${queryString}`
    : "/activity/my-history";

  const res = await api.get(endpoint);
  return res.data;
};

const activityService = {
  getMyActivity,
};

export default activityService;
