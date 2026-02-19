import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ticketService from "../../services/ticketService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddTeamMember, setShowAddTeamMember] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showManageTeam, setShowManageTeam] = useState(false);
  const [newTicketsCount, setNewTicketsCount] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'engineer'
  });

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

  const fetchTeamMembers = async () => {
    try {
      const res = await api.get("/users/team-members");
      setTeamMembers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching team members:", err);
    }
  };

  const fetchNewTicketsCount = useCallback(async () => {
    try {
      const tickets = await ticketService.getAllTickets({ status: "open" });
      setNewTicketsCount(tickets.length);
    } catch (err) {
      console.error("Failed to fetch new tickets count:", err);
    }
  }, []);

  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", {
        ...formData,
        connectionType: 'Commercial'
      });
      
      alert(`Team member added successfully!\n\nLogin credentials:\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nPlease save these credentials!`);
      
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'engineer'
      });
      setShowAddTeamMember(false);
      fetchTeamMembers();
    } catch (err) {
      console.error("Error adding team member:", err);
      alert(err.response?.data?.message || "Failed to add team member");
    }
  };

  useEffect(() => {
    fetchStats();
    fetchNewTicketsCount();
    
    // Auto-refresh tickets count every 30 seconds
    const interval = setInterval(() => {
      fetchNewTicketsCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchStats, fetchNewTicketsCount]);

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
              onClick={() => navigate("/admin/inventory")}
              className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition text-orange-700 font-medium"
            >
              <span className="text-2xl mr-2">📦</span> Inventory
            </button>

            <button
              onClick={() => navigate("/admin/finance")}
              className="flex items-center justify-center p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition text-emerald-700 font-medium"
            >
              <span className="text-2xl mr-2">💼</span> Financial Analytics
            </button>

            <button
              onClick={() => navigate("/admin/notifications")}
              className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition text-yellow-700 font-medium"
            >
              <span className="text-2xl mr-2">🔔</span> Notifications
            </button>

            <button
              onClick={() => setShowAddTeamMember(true)}
              className="flex items-center justify-center p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition text-indigo-700 font-medium"
            >
              <span className="text-2xl mr-2">👤</span> Add Team Member
            </button>

            <button
              onClick={() => {
                fetchTeamMembers();
                setShowManageTeam(true);
              }}
              className="flex items-center justify-center p-4 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition text-teal-700 font-medium"
            >
              <span className="text-2xl mr-2">👥</span> Manage Team
            </button>

            <button
              onClick={() => navigate("/admin/tickets")}
              className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition text-red-700 font-medium relative"
            >
              <span className="text-2xl mr-2">🎫</span> Support Tickets
              {newTicketsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[28px] text-center shadow-lg">
                  {newTicketsCount > 99 ? '99+' : newTicketsCount}
                </span>
              )}
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

      {/* Add Team Member Modal */}
      {showAddTeamMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add Team Member</h2>
              <button
                onClick={() => setShowAddTeamMember(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddTeamMember} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="engineer">Sales Engineer</option>
                  <option value="technician">Technician</option>
                  <option value="sales">Sales Manager</option>
                  <option value="support">Support Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                >
                  Add Team Member
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTeamMember(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Team Modal */}
      {showManageTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Manage Team Members</h2>
              <button
                onClick={() => setShowManageTeam(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {teamMembers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No team members found</p>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member._id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-xs text-gray-500">{member.phone || 'No phone'}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {member.role || 'Engineer'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
