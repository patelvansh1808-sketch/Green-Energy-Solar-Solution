import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">
          User Profile
        </h2>

        <div className="space-y-2 text-sm">
          <p><strong>Email:</strong> {user?.email || "User Email"}</p>
          <p><strong>Role:</strong> {user?.role || "User"}</p>
          <p><strong>Connection:</strong> {user?.connectionType || "Residential"}</p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
