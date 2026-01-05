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
    const token = localStorage.getItem("token");

    if (token) {
      // Decode JWT to get basic info
      const payload = JSON.parse(atob(token.split(".")[1]));
      
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
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    console.log("Login called with user data:", userData);
    localStorage.setItem("token", token);
    // Store full user data from login response
    setUser(userData);

    // Load customer profile to decide visibility for dashboard links
    fetchCustomerProfile();
  };

  const logout = () => {
    localStorage.removeItem("token");
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
