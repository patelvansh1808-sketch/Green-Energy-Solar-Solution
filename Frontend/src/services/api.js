import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log("TOKEN SENT:", token); // 🔥 DEBUG

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Log failing responses to quickly identify endpoint and status
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.config) {
      console.error(
        `[API ${error.response.status}] ${
          error.config.method?.toUpperCase() || ""
        } ${error.config.url}:`,
        error.response.data
      );
    } else if (error.message) {
      console.error("[API ERROR]", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
