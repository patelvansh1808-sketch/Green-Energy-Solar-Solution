import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  // 🔐 Not logged in → go to LOGIN
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔐 Role-based protection
  if (role) {
    // Support both single role (string) and multiple roles (array)
    const normalizeRole = (value) =>
      String(value || "")
        .toLowerCase()
        .replace(/[\s-]/g, "_");
    const allowedRoles = (Array.isArray(role) ? role : [role]).map(normalizeRole);
    const userRole = normalizeRole(user.role);

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
