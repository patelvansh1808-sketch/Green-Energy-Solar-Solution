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
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
