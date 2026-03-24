import React, { useState, useEffect } from "react";
import api from "../../services/api";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users?scope=customers");
      setUsers(response.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users by role
  const filteredUsers = users.filter((user) => {
    const normalizedRole = String(user.role || "").toLowerCase();
    const effectiveRole = ["user", "customer"].includes(normalizedRole)
      ? "user"
      : normalizedRole;
    const matchRole = filter === "all" || effectiveRole === filter;
    const matchSearch =
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    return matchRole && matchSearch;
  });

  const getRoleBadgeColor = (role) => {
    const colors = {
      user: "bg-gray-100 text-gray-800 border-gray-300",
      customer: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[String(role || "").toLowerCase()] || colors.user;
  };

  const getRoleLabel = (role) => {
    const normalizedRole = String(role || "").toLowerCase();
    return normalizedRole === "customer" || normalizedRole === "user"
      ? "Customer"
      : normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-800 border-green-300"
      : "bg-red-100 text-red-800 border-red-300";
  };

  const stats = {
    total: users.length,
    customers: users.filter((u) => ["user", "customer"].includes(String(u.role || "").toLowerCase())).length,
    active: users.filter((u) => u.isActive !== false).length,
    inactive: users.filter((u) => u.isActive === false).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Customer Users Management
          </h1>
          <p className="text-gray-600">View and manage customer/user accounts</p>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 font-medium">Total Users</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
              {stats.total}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-500 font-medium">Customers</p>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-2">
              {stats.customers}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-500 font-medium">Inactive Users</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
              {stats.inactive}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 border-emerald-500">
            <p className="text-sm text-gray-500 font-medium">Active Users</p>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">
              {stats.active}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Name, email, or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Role
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                <option value="user">Customer</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchUsers}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* USERS TABLE - Responsive */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No users found matching your filters</p>
          </div>
        ) : (
          <>
            {/* DESKTOP VIEW - Table */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Name
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Email
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Phone
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Role
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-4 sm:px-6 py-3">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <p className="text-sm text-gray-600 break-all">
                            {user.email}
                          </p>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <p className="text-sm text-gray-600">{user.phone}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(
                              user.isActive
                            )}`}
                          >
                            {user.isActive !== false ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TABLE FOOTER */}
              <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>

            {/* MOBILE VIEW - Cards */}
            <div className="md:hidden space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-lg shadow p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-800">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold border whitespace-nowrap shrink-0 ${getStatusBadgeColor(
                        user.isActive
                      )}`}
                    >
                      {user.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 font-medium min-w-fit">
                        Email:
                      </span>
                      <span className="text-gray-700 break-all">{user.email}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 font-medium min-w-fit">
                        Phone:
                      </span>
                      <span className="text-gray-700">{user.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 font-medium min-w-fit">
                        Role:
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-gray-50 px-4 py-3 rounded-lg text-sm text-gray-600 text-center">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
