import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

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
      
      // Decode token immediately without API call to avoid delays/errors
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        console.log("✅ Token decoded:", payload);
        const user = { _id: payload.id, role: payload.role, email: payload.email };
        login(token, user, refreshToken);
        
        const normalizedRole = String(payload.role || "")
          .toLowerCase()
          .replace(/[\s-]/g, "_");
        const isSupportRole = normalizedRole.includes("support");
        
        console.log("✅ Redirecting user with role:", normalizedRole);
        
        if (normalizedRole === "admin") {
          navigate("/admin");
        } else if (isSupportRole) {
          navigate("/support/tickets");
        } else if (normalizedRole === "engineer" || normalizedRole === "technician") {
          navigate("/engineer/dashboard");
        } else if (normalizedRole.includes("sales")) {
          navigate("/team/my-leads");
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("❌ Token decode failed:", err);
        navigate("/login?error=authentication_failed");
      }
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
