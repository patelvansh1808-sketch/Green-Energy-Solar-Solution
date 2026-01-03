import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data);
      setError("");
      setLoading(false);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Failed to load users");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
          {error}
          <button
            onClick={fetchUsers}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-semibold">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role || "User"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
