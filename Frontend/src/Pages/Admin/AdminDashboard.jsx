import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
      setError("");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <p className="p-6">No data available</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System overview and quick actions</p>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Users */}
          <button
            onClick={() => navigate("/admin/users")}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalUsers}</p>
                <p className="text-xs text-blue-500 mt-2">Click to view all</p>
              </div>
              <span className="text-4xl">👥</span>
            </div>
          </button>

          {/* Active Customers */}
          <button
            onClick={() => navigate("/admin/customers?status=Active")}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Customers</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeCustomers}</p>
                <p className="text-xs text-green-500 mt-2">Click to view all</p>
              </div>
              <span className="text-4xl">✅</span>
            </div>
          </button>

          {/* Inactive Customers */}
          <button
            onClick={() => navigate("/admin/customers?status=Inactive")}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Inactive Customers</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.inactiveCustomers}</p>
                <p className="text-xs text-yellow-500 mt-2">Click to view all</p>
              </div>
              <span className="text-4xl">⏳</span>
            </div>
          </button>

          {/* Total Bookings */}
          <button
            onClick={() => navigate("/admin/bookings")}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalBookings}</p>
                <p className="text-xs text-purple-500 mt-2">Click to view all</p>
              </div>
              <span className="text-4xl">📦</span>
            </div>
          </button>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/admin/create-customer")}
              className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition text-green-700 font-medium"
            >
              <span className="text-2xl mr-2">➕</span> Create Customer
            </button>

            <button
              onClick={() => navigate("/admin/customers")}
              className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-blue-700 font-medium"
            >
              <span className="text-2xl mr-2">👥</span> Manage Customers
            </button>

            <button
              onClick={() => navigate("/admin/bookings")}
              className="flex items-center justify-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition text-purple-700 font-medium"
            >
              <span className="text-2xl mr-2">📦</span> Bookings
            </button>

            <button
              onClick={() => navigate("/admin/notifications")}
              className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition text-yellow-700 font-medium"
            >
              <span className="text-2xl mr-2">🔔</span> Notifications
            </button>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
            {stats.recentBookings && stats.recentBookings.length > 0 ? (
              <div className="space-y-3">
                {stats.recentBookings.map((booking, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {booking.user?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent bookings</p>
            )}
          </div>

          {/* Recent Customer Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Customer Updates</h2>
            {stats.recentCustomers && stats.recentCustomers.length > 0 ? (
              <div className="space-y-3">
                {stats.recentCustomers.map((customer, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{customer.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(customer.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        customer.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : customer.status === "Inactive"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent customer updates</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
