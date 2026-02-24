import React, { useState, useEffect } from "react";
import bookingService from "../../services/bookingService";
import financeService from "../../services/financeService";

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: "",
    installationDate: "",
    technician: "",
    notes: "",
  });
  const [costData, setCostData] = useState({
    equipment: 0,
    labor: 0,
    logistics: 0,
    permits: 0,
    overhead: 0,
    other: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!selectedBooking) return;
    const breakdown = selectedBooking.costBreakdown || {};
    setCostData({
      equipment: breakdown.equipment || 0,
      labor: breakdown.labor || 0,
      logistics: breakdown.logistics || 0,
      permits: breakdown.permits || 0,
      overhead: breakdown.overhead || 0,
      other: breakdown.other || 0,
    });
  }, [selectedBooking]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getAllBookings();
      setBookings(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBooking = async (bookingId) => {
    try {
      await bookingService.updateBookingStatus(bookingId, updateData);
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, ...updateData } : b));
      setSelectedBooking(null);
      setUpdateData({ status: "", installationDate: "", technician: "", notes: "" });
    } catch (err) {
      setError(err.message || "Failed to update booking");
    }
  };

  const handleSaveCostBreakdown = async (bookingId) => {
    try {
      const res = await financeService.updateBookingCosts(bookingId, costData);
      setBookings(
        bookings.map((b) =>
          b._id === bookingId ? { ...b, costBreakdown: res.booking?.costBreakdown } : b
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update cost breakdown");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Pending": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Approved": "bg-blue-100 text-blue-800 border-blue-300",
      "Surveyed": "bg-purple-100 text-purple-800 border-purple-300",
      "Scheduled": "bg-orange-100 text-orange-800 border-orange-300",
      "In Progress": "bg-cyan-100 text-cyan-800 border-cyan-300",
      "Completed": "bg-green-100 text-green-800 border-green-300",
      "Cancelled": "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || colors["Pending"];
  };

  const getStatusIcon = (status) => {
    const icons = {
      "Pending": "⏳",
      "Approved": "✅",
      "Surveyed": "📐",
      "Scheduled": "📅",
      "In Progress": "⚙️",
      "Completed": "🎉",
      "Cancelled": "❌",
    };
    return icons[status] || "📋";
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchFilter = filter === "All" || booking.status === filter;
    const matchSearch = 
      booking.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.contactPhone?.includes(searchTerm) ||
      booking._id?.includes(searchTerm);
    return matchFilter && matchSearch;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "Pending").length,
    approved: bookings.filter(b => b.status === "Approved").length,
    inProgress: bookings.filter(b => b.status === "In Progress").length,
    completed: bookings.filter(b => b.status === "Completed").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Booking Management</h1>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: stats.total, color: "blue" },
            { label: "Pending", value: stats.pending, color: "yellow" },
            { label: "Approved", value: stats.approved, color: "green" },
            { label: "In Progress", value: stats.inProgress, color: "cyan" },
            { label: "Completed", value: stats.completed, color: "purple" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-${stat.color}-50 border-l-4 border-${stat.color}-500 p-6 rounded-lg shadow`}
            >
              <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Name, phone, or booking ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Bookings</option>
                <option value="Pending">⏳ Pending</option>
                <option value="Approved">✅ Approved</option>
                <option value="Surveyed">📐 Surveyed</option>
                <option value="Scheduled">📅 Scheduled</option>
                <option value="In Progress">⚙️ In Progress</option>
                <option value="Completed">🎉 Completed</option>
                <option value="Cancelled">❌ Cancelled</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchBookings}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Booking ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">System</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Applied Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-sm text-blue-600">#{booking._id?.slice(-8)}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {booking.customer?.fullName || booking.user?.name || "—"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.customer?.phone || booking.user?.phone || "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold">{booking.systemType}</p>
                        <p className="text-sm text-gray-500">{booking.capacity} kW</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-lg text-gray-800">
                          ₹{(booking.quotation?.totalCost || booking.finalCost || 0).toLocaleString()}
                        </p>
                        {(booking.quotation?.subsidyAmount || booking.subsidyAmount || 0) > 0 && (
                          <p className="text-sm text-green-600">
                            -₹{(booking.quotation?.subsidyAmount || booking.subsidyAmount || 0).toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)} {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded transition text-sm"
                        >
                          View & Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail & Update Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6">
                <h2 className="text-2xl font-bold text-white">Booking Details & Update</h2>
                <p className="text-blue-100 text-sm">#{selectedBooking._id?.slice(-8)}</p>
              </div>

              <div className="p-8 space-y-6">
                {/* Customer Details */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">👤 Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold text-gray-800">
                        {selectedBooking.customer?.fullName || selectedBooking.user?.name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-800">
                        {selectedBooking.customer?.phone || selectedBooking.user?.phone || "—"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-semibold text-gray-800">
                        {[
                          selectedBooking.installationAddress?.address || selectedBooking.customer?.address,
                          selectedBooking.installationAddress?.district || selectedBooking.customer?.district,
                          selectedBooking.installationAddress?.state || selectedBooking.customer?.state,
                          selectedBooking.installationAddress?.pincode || selectedBooking.customer?.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* System Details */}
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">⚡ System Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">System Type</p>
                      <p className="font-semibold text-gray-800">{selectedBooking.systemType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Capacity</p>
                      <p className="font-semibold text-gray-800">{selectedBooking.capacity} kW</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Roof Type</p>
                      <p className="font-semibold text-gray-800">{selectedBooking.roofType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Financing</p>
                      <p className="font-semibold text-gray-800">{selectedBooking.financingOption}</p>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">💰 Financial Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-gray-700">Estimated Cost:</p>
                      <p className="font-bold">
                        ₹{(
                          selectedBooking.quotation?.totalCost ||
                          selectedBooking.finalCost ||
                          selectedBooking.baseCost ||
                          0
                        ).toLocaleString()}
                      </p>
                    </div>
                    {(selectedBooking.quotation?.subsidyAmount || selectedBooking.subsidyAmount || 0) > 0 && (
                      <div className="flex justify-between text-green-700">
                        <p>Government Subsidy:</p>
                        <p className="font-bold">
                          -₹{(
                            selectedBooking.quotation?.subsidyAmount ||
                            selectedBooking.subsidyAmount ||
                            0
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between text-lg border-t pt-2">
                      <p className="font-bold">Final Cost:</p>
                      <p className="font-bold text-blue-600">
                        ₹{(
                          (selectedBooking.quotation?.netCost ||
                            (selectedBooking.quotation?.totalCost || 0) -
                              (selectedBooking.quotation?.subsidyAmount || 0) ||
                            selectedBooking.finalCost ||
                            0)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actual Cost Breakdown */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">🧾 Actual Cost Breakdown</h3>
                    <span className="text-xs text-gray-500">Used for profit analytics</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: "equipment", label: "Equipment" },
                      { key: "labor", label: "Labor" },
                      { key: "logistics", label: "Logistics" },
                      { key: "permits", label: "Permits" },
                      { key: "overhead", label: "Overhead" },
                      { key: "other", label: "Other" },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          {field.label}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={costData[field.key]}
                          onChange={(e) =>
                            setCostData({
                              ...costData,
                              [field.key]: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-600">
                      Total Cost: <span className="font-semibold">₹{(
                        (costData.equipment || 0) +
                        (costData.labor || 0) +
                        (costData.logistics || 0) +
                        (costData.permits || 0) +
                        (costData.overhead || 0) +
                        (costData.other || 0)
                      ).toLocaleString()}</span>
                    </p>
                    <button
                      onClick={() => handleSaveCostBreakdown(selectedBooking._id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      💾 Save Cost Breakdown
                    </button>
                  </div>
                </div>

                {/* Update Form */}
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <h3 className="text-lg font-bold text-gray-800">📝 Update Booking</h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={updateData.status || selectedBooking.status}
                      onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Pending">⏳ Pending</option>
                      <option value="Approved">✅ Approved</option>
                      <option value="Surveyed">📐 Surveyed</option>
                      <option value="Scheduled">📅 Scheduled</option>
                      <option value="In Progress">⚙️ In Progress</option>
                      <option value="Completed">🎉 Completed</option>
                      <option value="Cancelled">❌ Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Installation Date</label>
                    <input
                      type="date"
                      value={updateData.installationDate}
                      onChange={(e) => setUpdateData({ ...updateData, installationDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned Technician</label>
                    <input
                      type="text"
                      value={updateData.technician}
                      onChange={(e) => setUpdateData({ ...updateData, technician: e.target.value })}
                      placeholder="Technician name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes / Comments</label>
                    <textarea
                      value={updateData.notes}
                      onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                      placeholder="Internal notes for operations team"
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                </div>

                {/* Remarks */}
                {selectedBooking.customerRemarks && (
                  <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">📌 Customer Remarks</h3>
                    <p className="text-gray-700">{selectedBooking.customerRemarks}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleUpdateBooking(selectedBooking._id)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    💾 Save Updates
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
