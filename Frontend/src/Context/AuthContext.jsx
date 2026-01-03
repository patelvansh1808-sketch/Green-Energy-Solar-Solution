import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Decode JWT to get basic info
      const payload = JSON.parse(atob(token.split(".")[1]));
      
      // Fetch full user data from backend using correct endpoint
      API.get("/users/profile")
        .then((res) => {
          console.log("User data fetched from profile:", res.data);
          setUser(res.data);
        })
        .catch((err) => {
          console.error("Failed to fetch user profile:", err.response?.data || err.message);
          // Fall back to decoded payload if API fails
          setUser(payload);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    console.log("Login called with user data:", userData);
    localStorage.setItem("token", token);
    // Store full user data from login response
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
