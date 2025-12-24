import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  // 🔐 Not logged in → go to HOME
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 🔐 Role-based admin protection
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
