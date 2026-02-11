import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(
  (config) => {
    // Use accessToken if available, fall back to token for backward compatibility
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (token) {
      // Validate token format (should have 3 parts separated by dots)
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.warn("⚠️ TOKEN WARNING: Invalid token format detected");
        console.log("TOKEN LENGTH:", token.length);
        console.log("TOKEN PARTS:", tokenParts.length);
        // Clear invalid token
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        return config;
      }
      
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
      console.log("✅ TOKEN SENT: Valid token (", token.substring(0, 20), "...)");
    } else {
      console.warn("⚠️  No token found in localStorage");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Log failing responses to quickly identify endpoint and status
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const res = await axios.post("http://localhost:5000/api/auth/refresh-token", {
            refreshToken,
          });

          // Update the access token
          localStorage.setItem("accessToken", res.data.accessToken);
          localStorage.setItem("token", res.data.accessToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

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
