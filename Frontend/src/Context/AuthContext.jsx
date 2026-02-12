import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [hasCustomerProfile, setHasCustomerProfile] = useState(false);

  const fetchCustomerProfile = async () => {
    try {
      const res = await API.get("/customers/me");
      setCustomerProfile(res.data);
      setHasCustomerProfile(true);
    } catch (err) {
      if (err.response?.status === 404) {
        // No customer profile yet; keep flag false so dashboard stays hidden
        setCustomerProfile(null);
        setHasCustomerProfile(false);
      } else {
        console.error("Failed to fetch customer profile:", err.response?.data || err.message);
      }
    }
  };

  useEffect(() => {
    const hasInitialized = sessionStorage.getItem("hasInitialized");
    const token = localStorage.getItem("token");

    // First load in this browser tab/session - show public landing
    if (!hasInitialized) {
      sessionStorage.setItem("hasInitialized", "true");
      if (token) {
        // Clear token on first load to show public landing page
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
      setLoading(false);
      return;
    }

    // Subsequent loads (refresh) - auto-login if token exists
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length !== 3) {
          throw new Error("Invalid token format");
        }

        // Decode JWT to get basic info
        const payload = JSON.parse(atob(parts[1]));

        // Fetch full user data then customer profile
        (async () => {
          try {
            const res = await API.get("/users/profile");
            console.log("User data fetched from profile:", res.data);
            setUser(res.data);
          } catch (err) {
            console.error("Failed to fetch user profile:", err.response?.data || err.message);
            // Fall back to decoded payload if API fails
            setUser(payload);
          } finally {
            setLoading(false);
          }

          await fetchCustomerProfile();
        })();
      } catch (err) {
        console.error("Invalid token, clearing session:", err.message);
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData, refreshToken = null) => {
    console.log("Login called with user data:", userData);
    localStorage.setItem("token", token);
    localStorage.setItem("accessToken", token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    // Store full user data from login response
    setUser(userData);

    // Load customer profile to decide visibility for dashboard links
    fetchCustomerProfile();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        customerProfile,
        hasCustomerProfile,
        refreshCustomerProfile: fetchCustomerProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
