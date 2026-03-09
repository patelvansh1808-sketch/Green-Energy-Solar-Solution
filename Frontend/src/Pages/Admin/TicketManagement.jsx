import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../Context/AuthContext";
import ticketService from "../../services/ticketService";
import api from "../../services/api";

export default function TicketManagement() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [stats, setStats] = useState(null);
  const [supportUsers, setSupportUsers] = useState([]);

  // Auto-filter to show only support staff's assigned tickets
  const [filters, setFilters] = useState(() => {
    if (user?.role === "support") {
      return {
        status: "",
        category: "",
        priority: "",
        assignedTo: user._id || "",
      };
    }
    return {
      status: "",
      category: "",
      priority: "",
      assignedTo: "",
    };
  });

  const fetchTickets = useCallback(async () => {
    try {
      const data = await ticketService.getAllTickets(filters);
      setTickets(data);
      setError("");
    } catch (err) {
      console.error("Fetch tickets error:", err);
      setError(err.response?.data?.message || "Failed to load tickets");
      setTickets([]); // Set empty array on failure
    }
  }, [filters]);

  const fetchStats = async () => {
    try {
      const data = await ticketService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setError("Failed to load statistics");
    }
  };

  const fetchSupportUsers = async () => {
    try {
      const res = await api.get("/users/team-members");
      // team-members returns { success: true, data: [...] }
      const allTeamMembers = res.data.data || res.data;
      // Filter for support and admin roles
      const supportStaff = allTeamMembers.filter((u) => u.role === "support" || u.role === "admin");
      setSupportUsers(supportStaff);
      console.log("Support users loaded:", supportStaff);
    } catch (err) {
      console.error("Failed to fetch support users:", err);
      setError("Failed to load support staff");
      setSupportUsers([]); // Set empty array on failure
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchTickets(),
          fetchStats(),
          fetchSupportUsers()
        ]);
      } catch (err) {
        console.error("Error loading ticket data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [filters, fetchTickets]);

  // Auto-refresh tickets every 60 seconds to check for new submissions
  useEffect(() => {
    const autoRefresh = setInterval(() => {
      fetchTickets();
      fetchStats();
    }, 60000); // 60 seconds
    
    return () => clearInterval(autoRefresh);
  }, [fetchTickets]);

  const handleAssign = async (ticketId, assignedTo) => {
    try {
      await ticketService.assignTicket(ticketId, assignedTo);
      setSuccess("Ticket assigned successfully!");
      await fetchTickets();
      if (selectedTicket?._id === ticketId) {
        const updated = await ticketService.getTicketById(ticketId);
        setSelectedTicket(updated);
      }
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign ticket");
    }
  };

  const handleAddResponse = async () => {
    if (!responseMessage.trim()) return;
    try {
      await ticketService.addResponse(selectedTicket._id, responseMessage, false);
      setResponseMessage("");
      const updated = await ticketService.getTicketById(selectedTicket._id);
      setSelectedTicket(updated);
      setSuccess("Response added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add response");
    }
  };

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      setError("Please provide resolution notes");
      return;
    }
    try {
      await ticketService.resolveTicket(selectedTicket._id, resolutionNotes);
      setResolutionNotes("");
      const updated = await ticketService.getTicketById(selectedTicket._id);
      setSelectedTicket(updated);
      await fetchTickets();
      await fetchStats();
      setSuccess("Ticket resolved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resolve ticket");
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await ticketService.updateStatus(ticketId, newStatus);
      await fetchTickets();
      if (selectedTicket?._id === ticketId) {
        const updated = await ticketService.getTicketById(ticketId);
        setSelectedTicket(updated);
      }
      setSuccess("Status updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      return;
    }
    try {
      await ticketService.deleteTicket(ticketId);
      await fetchTickets();
      await fetchStats();
      if (selectedTicket?._id === ticketId) {
        setShowDetailModal(false);
      }
      setSuccess("Ticket deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete ticket");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      pending: "bg-orange-100 text-orange-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return badges[priority] || "bg-gray-100 text-gray-800";
  };

  const isChargeableServiceCategory = (category) =>
    category === "solar_upgrade" || category === "solar_relocation";

  const parseServiceDetailsFromDescription = (description = "") => {
    const marker = "--- Service Details ---";
    if (!description.includes(marker)) {
      return { baseDescription: description, details: {} };
    }

    const [baseDescriptionRaw, detailsRaw] = description.split(marker);
    const detailLines = (detailsRaw || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const details = {};
    detailLines.forEach((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex > 0) {
        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();
        details[key] = value;
      }
    });

    return {
      baseDescription: (baseDescriptionRaw || "").trim(),
      details,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === "support" ? "My Assigned Tickets" : "Ticket Management"}
          </h1>
          {user?.role === "support" && (
            <p className="text-gray-600 mt-1">
              {`Showing tickets assigned to you • ${user?.firstName} ${user?.lastName}`}
            </p>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* New Tickets Notification */}
        {tickets.filter(t => t.status === 'open').length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <span className="font-bold">{tickets.filter(t => t.status === 'open').length}</span> new ticket{tickets.filter(t => t.status === 'open').length > 1 ? 's' : ''} waiting for response
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {stats && stats.byStatus && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">Open</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.byStatus.find((s) => s._id === "open")?.count || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.byStatus.find((s) => s._id === "in_progress")?.count || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">Pending</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.byStatus.find((s) => s._id === "pending")?.count || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">Resolved</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.byStatus.find((s) => s._id === "resolved")?.count || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-2">Total</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">All</option>
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="installation">Installation</option>
                <option value="maintenance">Maintenance</option>
                <option value="solar_upgrade">Solar Upgrade</option>
                <option value="solar_relocation">Solar Relocation</option>
                <option value="warranty">Warranty</option>
                <option value="complaint">Complaint</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assigned To
              </label>
              <select
                value={filters.assignedTo}
                onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                disabled={user?.role === "support"}
                className={`w-full border border-gray-300 rounded-lg px-4 py-2 ${
                  user?.role === "support" ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value="">All</option>
                {supportUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            </div>
            {user?.role === "admin" && (
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ status: "", category: "", priority: "", assignedTo: "" })}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No tickets found</p>
            </div>
          ) : (
            <>
              {/* DESKTOP VIEW */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Ticket #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                      {user?.role === "admin" && (
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Assigned To
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                      <tr key={ticket._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">
                            {ticket.ticketNumber}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {ticket.customerName}
                          </p>
                          <p className="text-sm text-gray-600">{ticket.customerEmail}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{ticket.subject}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 capitalize">
                            {ticket.category.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                              ticket.status
                            )}`}
                          >
                            {ticket.status.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        {user?.role === "admin" && (
                          <td className="px-6 py-4">
                            <select
                              value={ticket.assignedTo?._id || ""}
                              onChange={(e) => handleAssign(ticket._id, e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-1 text-sm"
                            >
                              <option value="">Unassigned</option>
                              {supportUsers.map((u) => (
                                <option key={u._id} value={u._id}>
                                  {u.firstName} {u.lastName}
                                </option>
                              ))}
                            </select>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setShowDetailModal(true);
                              }}
                              className="bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-800 px-4 py-2 rounded text-sm font-semibold transition"
                            >
                              Manage
                            </button>
                            {user?.role === "admin" && (
                              <button
                                onClick={() => handleDeleteTicket(ticket._id)}
                                className="bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 px-4 py-2 rounded text-sm font-semibold transition"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE VIEW */}
              <div className="md:hidden p-4 space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {ticket.ticketNumber}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {ticket.customerName}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${getStatusBadge(
                          ticket.status
                        )}`}
                      >
                        {ticket.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-600 font-medium">Subject</p>
                      <p className="font-medium text-gray-900 mt-1 text-sm">
                        {ticket.subject}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-gray-600 font-medium">Category</p>
                        <p className="text-gray-700 mt-1 capitalize text-xs">
                          {ticket.category.replace("_", " ")}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-gray-600 font-medium">Priority</p>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${getPriorityBadge(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowDetailModal(true);
                        }}
                        className="flex-1 bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-800 px-3 py-2 rounded text-sm font-semibold transition"
                      >
                        Manage
                      </button>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => handleDeleteTicket(ticket._id)}
                          className="flex-1 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 px-3 py-2 rounded text-sm font-semibold transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full my-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedTicket.ticketNumber}
                  </h2>
                  <p className="text-gray-600 mt-1">{selectedTicket.subject}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-2xl text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Customer</p>
                  <p className="text-gray-900">{selectedTicket.customerName}</p>
                  <p className="text-sm text-gray-600">{selectedTicket.customerEmail}</p>
                  <p className="text-sm text-gray-600">{selectedTicket.customerPhone}</p>
                </div>

                {/* Status & Assignment */}
                <div className={`grid ${user?.role === "admin" ? "grid-cols-3" : "grid-cols-2"} gap-4`}>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Status</p>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Priority</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(
                        selectedTicket.priority
                      )}`}
                    >
                      {selectedTicket.priority.toUpperCase()}
                    </span>
                  </div>
                  {user?.role === "admin" && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Assign To</p>
                      <select
                        value={selectedTicket.assignedTo?._id || ""}
                        onChange={(e) => handleAssign(selectedTicket._id, e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      >
                        <option value="">Unassigned</option>
                        {supportUsers.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.firstName} {u.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
                  <p className="text-gray-900 whitespace-pre-line">
                    {parseServiceDetailsFromDescription(selectedTicket.description).baseDescription ||
                      selectedTicket.description}
                  </p>
                </div>

                {/* Chargeable Service Details */}
                {isChargeableServiceCategory(selectedTicket.category) && (() => {
                  const parsed = parseServiceDetailsFromDescription(selectedTicket.description);
                  const details = parsed.details || {};
                  const currentLocation = details["Current Location"];
                  const newLocation = details["New Location"];
                  const expectedCapacity = details["Expected Capacity (kW)"];

                  if (!currentLocation && !newLocation && !expectedCapacity) return null;

                  return (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-amber-800 mb-3">
                        Chargeable Service Request Details
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {currentLocation && (
                          <div className="bg-white border border-amber-200 rounded p-3">
                            <p className="text-xs text-gray-600">Current Location</p>
                            <p className="text-gray-900 font-medium mt-1">{currentLocation}</p>
                          </div>
                        )}
                        {newLocation && (
                          <div className="bg-white border border-amber-200 rounded p-3">
                            <p className="text-xs text-gray-600">New Location</p>
                            <p className="text-gray-900 font-medium mt-1">{newLocation}</p>
                          </div>
                        )}
                        {expectedCapacity && (
                          <div className="bg-white border border-amber-200 rounded p-3">
                            <p className="text-xs text-gray-600">Expected Capacity (kW)</p>
                            <p className="text-gray-900 font-medium mt-1">{expectedCapacity}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Conversation */}
                {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Conversation
                    </h3>
                    <div className="space-y-4">
                      {selectedTicket.responses.map((response, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg ${
                            response.isCustomerResponse
                              ? "bg-blue-50 ml-8"
                              : "bg-green-50 mr-8"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold text-gray-900">
                              {response.responderName}
                              {response.isCustomerResponse ? " (Customer)" : " (Support)"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(response.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-gray-900">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Response */}
                {selectedTicket.status !== "closed" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Add Response
                    </label>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      rows="3"
                      placeholder="Type your response..."
                    />
                    <button
                      onClick={handleAddResponse}
                      className="mt-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Send Response
                    </button>
                  </div>
                )}

                {/* Resolve Ticket */}
                {selectedTicket.status !== "resolved" && selectedTicket.status !== "closed" && (
                  <div className="border-t pt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Resolve Ticket
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      rows="3"
                      placeholder="Resolution notes..."
                    />
                    <button
                      onClick={handleResolve}
                      className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                )}

                {/* Resolution Details */}
                {selectedTicket.resolution && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-green-700 mb-2">Resolution</p>
                    <p className="text-gray-900 mb-2">{selectedTicket.resolution.notes}</p>
                    <p className="text-sm text-gray-600">
                      Resolved by {selectedTicket.resolution.resolvedByName} on{" "}
                      {new Date(selectedTicket.resolution.date).toLocaleString()}
                    </p>
                    {selectedTicket.resolution.customerSatisfaction && (
                      <p className="text-sm text-gray-600 mt-2">
                        Customer Satisfaction: {selectedTicket.resolution.customerSatisfaction}/5
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full mt-6 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
