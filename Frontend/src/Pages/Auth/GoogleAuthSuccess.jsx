import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import api from "../../services/api";

export default function GoogleAuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get tokens from URL (new way with accessToken and refreshToken)
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    
    // Fallback for legacy token format
    const legacyToken = searchParams.get("token");
    const token = accessToken || legacyToken;
    
    if (token) {
      // Store both tokens
      localStorage.setItem("accessToken", token);
      localStorage.setItem("token", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      
      console.log("✅ Tokens stored successfully");
      console.log("Access Token:", token.substring(0, 20) + "...");
      
      // Fetch user profile using the api instance (which includes auth header)
      api
        .get("/users/profile")
        .then((res) => {
          console.log("✅ User profile fetched:", res.data);
          login(token, res.data, refreshToken);
          const role = res.data?.role;
          if (role === "admin") {
            navigate("/admin");
          } else if (role === "support") {
            navigate("/admin/tickets");
          } else if (role === "engineer" || role === "technician") {
            navigate("/engineer/dashboard");
          } else {
            navigate("/");
          }
        })
        .catch((error) => {
          console.error("❌ Error fetching user profile:", error.response?.data || error.message);
          // Try decoding token if profile fetch fails
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            const user = { _id: payload.id, role: payload.role };
            login(token, user, refreshToken);
            if (user.role === "admin") {
              navigate("/admin");
            } else if (user.role === "support") {
              navigate("/admin/tickets");
            } else if (user.role === "engineer" || user.role === "technician") {
              navigate("/engineer/dashboard");
            } else {
              navigate("/");
            }
          } catch (err) {
            console.error("❌ Token decode failed:", err);
            navigate("/login?error=authentication_failed");
          }
        });
    } else {
      console.error("❌ No token found in URL");
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
