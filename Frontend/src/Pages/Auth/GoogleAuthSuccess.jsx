import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import api from "../../services/api";

export default function GoogleAuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (token) {
      // Store token first
      localStorage.setItem("token", token);
      
      // Fetch user profile using the api instance (which includes auth header)
      api
        .get("/users/profile")
        .then((res) => {
          console.log("User profile fetched:", res.data);
          login(token, res.data);
          const role = res.data?.role;
          if (role === "admin") {
            navigate("/admin");
          } else if (role === "support") {
            navigate("/admin/tickets");
          } else if (role === "engineer") {
            navigate("/engineer/dashboard");
          } else {
            navigate("/");
          }
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error.response?.data || error.message);
          // Try decoding token if profile fetch fails
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            const user = { _id: payload.userId, role: payload.role };
            login(token, user);
            if (user.role === "admin") {
              navigate("/admin");
            } else if (user.role === "support") {
              navigate("/admin/tickets");
            } else if (user.role === "engineer") {
              navigate("/engineer/dashboard");
            } else {
              navigate("/");
            }
          } catch (err) {
            console.error("Token decode failed:", err);
            navigate("/login?error=authentication_failed");
          }
        });
    } else {
      navigate("/login?error=no_token");
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Completing Google Sign In...</p>
      </div>
    </div>
  );
}
