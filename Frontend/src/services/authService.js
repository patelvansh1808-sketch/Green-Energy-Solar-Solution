import api from "./api";

export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  // Store both access and refresh tokens
  localStorage.setItem("accessToken", res.data.accessToken);
  localStorage.setItem("refreshToken", res.data.refreshToken);
  // Legacy support
  localStorage.setItem("token", res.data.accessToken);
  return res.data;
};

export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  // Store both access and refresh tokens
  localStorage.setItem("accessToken", res.data.accessToken);
  localStorage.setItem("refreshToken", res.data.refreshToken);
  // Legacy support
  localStorage.setItem("token", res.data.accessToken);
  return res.data;
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const res = await api.post("/auth/refresh-token", { refreshToken });
    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("token", res.data.accessToken);
    return res.data;
  } catch (error) {
    // If refresh fails, logout user
    logoutUser();
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
