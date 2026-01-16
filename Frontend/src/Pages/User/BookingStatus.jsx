import React, { useState, useEffect } from "react";
import bookingService from "../../services/bookingService";

const BookingStatus = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedDetails, setExpandedDetails] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getMyBookings();
      setBookings(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-blue-50 border-blue-300 text-blue-700",
      Approved: "bg-green-50 border-green-300 text-green-700",
      Surveyed: "bg-purple-50 border-purple-300 text-purple-700",
      Scheduled: "bg-orange-50 border-orange-300 text-orange-700",
      "In Progress": "bg-yellow-50 border-yellow-300 text-yellow-700",
      Completed: "bg-emerald-50 border-emerald-300 text-emerald-700",
      Cancelled: "bg-red-50 border-red-300 text-red-700",
    };
    return colors[status] || colors.Pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: "📋",
      Approved: "✅",
      Surveyed: "🔍",
      Scheduled: "📅",
      "In Progress": "⚙️",
      Completed: "🎉",
      Cancelled: "❌",
    };
    return icons[status] || "📝";
  };

  const getProgressPercentage = (status) => {
    const progress = {
      Pending: 15,
      Approved: 30,
      Surveyed: 50,
      Scheduled: 65,
      "In Progress": 85,
      Completed: 100,
      Cancelled: 0,
    };
    return progress[status] || 0;
  };

  const toggleDetails = (bookingId) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      await bookingService.deleteBooking(bookingId);
      setBookings(bookings.filter(b => b._id !== bookingId));
      setDeleteConfirm(null);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete booking");
      setDeleteConfirm(null);
    }
  };

  const downloadBookingReport = (booking) => {
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Booking Report - ${booking._id?.slice(-8)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
            .header h1 { color: #1f2937; margin: 0; font-size: 28px; }
            .header p { color: #6b7280; margin: 5px 0; }
            .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-left: 4px solid #2563eb; }
            .section h2 { color: #1f2937; margin: 0 0 15px 0; font-size: 18px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: 600; color: #4b5563; }
            .detail-value { color: #1f2937; }
            .status { display: inline-block; padding: 6px 12px; border-radius: 6px; font-weight: bold; }
            .status-pending { background: #dbeafe; color: #1e40af; }
            .status-approved { background: #dcfce7; color: #166534; }
            .status-completed { background: #d1fae5; color: #065f46; }
            .status-progress { background: #fef3c7; color: #92400e; }
            .timeline { margin: 20px 0; }
            .timeline-item { display: flex; gap: 15px; margin: 15px 0; }
            .timeline-icon { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
            .timeline-icon.completed { background: #22c55e; color: white; }
            .timeline-icon.pending { background: #e5e7eb; color: #6b7280; }
            .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>☀️ Solar Installation Booking Report</h1>
            <p>Booking ID: #${booking._id?.slice(-8).toUpperCase()}</p>
            <p>Generated on: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          <div class="section">
            <h2>📋 Booking Information</h2>
            <div class="detail-row">
              <span class="detail-label">Full Booking ID:</span>
              <span class="detail-value">${booking._id}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">System Type:</span>
              <span class="detail-value">${booking.systemType}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">System Capacity:</span>
              <span class="detail-value">${booking.capacity} kW</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Roof Type:</span>
              <span class="detail-value">${booking.roofType || "Not specified"}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value"><span class="status status-${booking.status.toLowerCase().replace(' ', '-')}">${booking.status}</span></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Applied Date:</span>
              <span class="detail-value">${new Date(booking.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </div>

          <div class="section">
            <h2>💰 Financial Details</h2>
            <div class="detail-row">
              <span class="detail-label">Estimated Cost:</span>
              <span class="detail-value">₹${booking.estimatedCost?.toLocaleString("en-IN") || "0"}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Government Subsidy:</span>
              <span class="detail-value" style="color: #16a34a;">₹${booking.subsidyAmount?.toLocaleString("en-IN") || "0"}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label"><strong>Final Cost (After Subsidy):</strong></span>
              <span class="detail-value"><strong>₹${((booking.estimatedCost || 0) - (booking.subsidyAmount || 0)).toLocaleString("en-IN")}</strong></span>
            </div>
            ${booking.financingOption ? `
            <div class="detail-row">
              <span class="detail-label">Financing Option:</span>
              <span class="detail-value">${booking.financingOption}</span>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <h2>📍 Installation Location</h2>
            ${booking.state ? `<div class="detail-row"><span class="detail-label">State:</span><span class="detail-value">${booking.state}</span></div>` : ''}
            ${booking.district ? `<div class="detail-row"><span class="detail-label">District:</span><span class="detail-value">${booking.district}</span></div>` : ''}
            ${booking.address ? `<div class="detail-row"><span class="detail-label">Address:</span><span class="detail-value">${booking.address}</span></div>` : ''}
            ${booking.pincode ? `<div class="detail-row"><span class="detail-label">Pincode:</span><span class="detail-value">${booking.pincode}</span></div>` : ''}
          </div>

          ${booking.contactPerson || booking.contactPhone ? `
          <div class="section">
            <h2>📞 Contact Information</h2>
            ${booking.contactPerson ? `<div class="detail-row"><span class="detail-label">Contact Person:</span><span class="detail-value">${booking.contactPerson}</span></div>` : ''}
            ${booking.contactPhone ? `<div class="detail-row"><span class="detail-label">Phone:</span><span class="detail-value">${booking.contactPhone}</span></div>` : ''}
          </div>
          ` : ''}

          <div class="section">
            <h2>📅 Installation Timeline</h2>
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-icon completed">✓</div>
                <div>
                  <strong>Application Submitted</strong><br>
                  <small>${new Date(booking.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</small>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-icon ${["Approved", "Surveyed", "Scheduled", "In Progress", "Completed"].includes(booking.status) ? 'completed' : 'pending'}">${["Approved", "Surveyed", "Scheduled", "In Progress", "Completed"].includes(booking.status) ? '✓' : '2'}</div>
                <div>
                  <strong>Under Review</strong><br>
                  <small>${booking.reviewedDate ? new Date(booking.reviewedDate).toLocaleDateString("en-IN") : 'Pending...'}</small>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-icon ${["Surveyed", "Scheduled", "In Progress", "Completed"].includes(booking.status) ? 'completed' : 'pending'}">${["Surveyed", "Scheduled", "In Progress", "Completed"].includes(booking.status) ? '✓' : '3'}</div>
                <div>
                  <strong>Site Survey</strong><br>
                  <small>${booking.surveyDate ? new Date(booking.surveyDate).toLocaleDateString("en-IN") : 'Awaiting...'}</small>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-icon ${["Scheduled", "In Progress", "Completed"].includes(booking.status) ? 'completed' : 'pending'}">${["Scheduled", "In Progress", "Completed"].includes(booking.status) ? '✓' : '4'}</div>
                <div>
                  <strong>Installation</strong><br>
                  <small>${booking.expectedInstallationDate ? new Date(booking.expectedInstallationDate).toLocaleDateString("en-IN") : 'TBD'}</small>
                </div>
              </div>
            </div>
          </div>

          ${booking.remarks ? `
          <div class="section">
            <h2>📝 Special Notes</h2>
            <p>${booking.remarks}</p>
          </div>
          ` : ''}

          <div class="footer">
            <p>This is a computer-generated report. For assistance, please contact our support team.</p>
            <p>Green Energy Solar Solutions | ${new Date().getFullYear()}</p>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-xl text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              Booking Status Tracker
            </h1>
            <p className="text-gray-600 text-lg">Monitor your solar installation progress in real-time</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
              <p className="text-gray-600 text-sm mt-1">Total Bookings</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {bookings.filter((b) => b.status === "Completed").length}
              </p>
              <p className="text-gray-600 text-sm mt-1">Completed</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {bookings.filter((b) => b.status === "In Progress").length}
              </p>
              <p className="text-gray-600 text-sm mt-1">In Progress</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {bookings.filter((b) => ["Pending", "Approved"].includes(b.status)).length}
              </p>
              <p className="text-gray-600 text-sm mt-1">Pending Review</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* No Bookings State */}
        {bookings.length === 0 && !error && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-16 text-center">
            <p className="text-5xl mb-4">☀️</p>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Yet</h2>
            <p className="text-gray-600 mb-6">Start your solar journey by creating a new booking</p>
            <a
              href="/booking"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Create New Booking
            </a>
          </div>
        )}

        {/* Bookings List */}
        {bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {/* Header Card */}
                <div className="bg-blue-600 p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-blue-100 uppercase tracking-wider">Booking ID</p>
                      <p className="text-2xl font-bold font-mono">#{booking._id?.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-100 uppercase tracking-wider">{booking.systemType}</p>
                      <p className="text-2xl font-bold">{booking.capacity} kW</p>
                    </div>
                  </div>
                  <p className="text-blue-100 text-sm mt-3">
                    Applied: {new Date(booking.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>

                {/* Status & Progress Section */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-4xl">{getStatusIcon(booking.status)}</span>
                    <div>
                      <p className="text-gray-600 text-sm uppercase tracking-wider">Current Status</p>
                      <p className={`text-lg font-bold px-4 py-2 rounded-lg border-l-4 ${getStatusColor(booking.status)} w-fit`}>
                        {booking.status}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-gray-600 text-sm">Progress</p>
                      <p className="text-blue-600 font-semibold">{getProgressPercentage(booking.status)}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-700"
                        style={{ width: `${getProgressPercentage(booking.status)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Financial Details Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-600 text-sm uppercase tracking-wider mb-2">System Capacity</p>
                    <p className="text-2xl font-bold text-blue-600">{booking.capacity} kW</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-gray-600 text-sm uppercase tracking-wider mb-2">Estimated Cost</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{booking.estimatedCost?.toLocaleString("en-IN") || "0"}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-gray-600 text-sm uppercase tracking-wider mb-2">Govt. Subsidy</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{booking.subsidyAmount?.toLocaleString("en-IN") || "0"}
                    </p>
                  </div>
                </div>

                {/* Enhanced Timeline */}
                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-6 text-lg flex items-center gap-2">
                    <span>📅</span> Installation Timeline
                  </h3>
                  <div className="space-y-4">
                    {/* Stage 1: Application */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                        ✓
                      </div>
                      <div className="flex-1 pb-4 border-b border-gray-200">
                        <p className="font-semibold text-gray-800">Application Submitted</p>
                        <p className="text-gray-600 text-sm mt-1">
                          {new Date(booking.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {/* Stage 2: Under Review */}
                    <div className="flex gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold transition ${
                          ["Approved", "Surveyed", "Scheduled", "In Progress", "Completed"].includes(booking.status)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {["Approved", "Surveyed", "Scheduled", "In Progress", "Completed"].includes(booking.status) ? "✓" : "2"}
                      </div>
                      <div className="flex-1 pb-4 border-b border-gray-200">
                        <p className="font-semibold text-gray-800">Under Review</p>
                        <p className="text-gray-600 text-sm mt-1">
                          {booking.reviewedDate
                            ? new Date(booking.reviewedDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
                            : "Pending review..."}
                        </p>
                      </div>
                    </div>

                    {/* Stage 3: Site Survey */}
                    <div className="flex gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold transition ${
                          ["Surveyed", "Scheduled", "In Progress", "Completed"].includes(booking.status)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {["Surveyed", "Scheduled", "In Progress", "Completed"].includes(booking.status) ? "✓" : "3"}
                      </div>
                      <div className="flex-1 pb-4 border-b border-gray-200">
                        <p className="font-semibold text-gray-800">Site Survey & Quotation</p>
                        <p className="text-gray-600 text-sm mt-1">
                          {booking.surveyDate
                            ? new Date(booking.surveyDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
                            : "Awaiting scheduling..."}
                        </p>
                      </div>
                    </div>

                    {/* Stage 4: Installation */}
                    <div className="flex gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold transition ${
                          ["Scheduled", "In Progress", "Completed"].includes(booking.status)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {["Scheduled", "In Progress", "Completed"].includes(booking.status) ? "✓" : "4"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Installation & Commission</p>
                        <p className="text-gray-600 text-sm mt-1">
                          {booking.expectedInstallationDate
                            ? new Date(booking.expectedInstallationDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
                            : "Date to be confirmed..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {(booking.state || booking.district || booking.remarks) && (
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span>📍</span> Location & Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {booking.state && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-gray-600 text-sm uppercase tracking-wider">State</p>
                          <p className="font-semibold text-gray-800 mt-1">{booking.state}</p>
                        </div>
                      )}
                      {booking.district && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-gray-600 text-sm uppercase tracking-wider">District</p>
                          <p className="font-semibold text-gray-800 mt-1">{booking.district}</p>
                        </div>
                      )}
                      {booking.remarks && (
                        <div className="bg-gray-50 rounded-lg p-3 md:col-span-2 border border-gray-200">
                          <p className="text-gray-600 text-sm uppercase tracking-wider">Special Notes</p>
                          <p className="text-gray-800 mt-1">{booking.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Expandable Full Details */}
                {expandedDetails[booking._id] && (
                  <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span>🔍</span> Complete Booking Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 space-y-3 border border-gray-200">
                        <div>
                          <p className="text-gray-600 text-xs uppercase tracking-wider">Booking ID</p>
                          <p className="font-mono text-gray-800 mt-1">{booking._id}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs uppercase tracking-wider">System Type</p>
                          <p className="text-gray-800 mt-1">{booking.systemType}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs uppercase tracking-wider">Roof Type</p>
                          <p className="text-gray-800 mt-1">{booking.roofType || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs uppercase tracking-wider">Financing Option</p>
                          <p className="text-gray-800 mt-1">{booking.financingOption || "Full Payment"}</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 space-y-3 border border-gray-200">
                        <div>
                          <p className="text-gray-600 text-xs uppercase tracking-wider">Final Cost (After Subsidy)</p>
                          <p className="text-green-600 text-lg font-bold mt-1">
                            ₹{((booking.estimatedCost || 0) - (booking.subsidyAmount || 0)).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs uppercase tracking-wider">Contact Person</p>
                          <p className="text-gray-800 mt-1">{booking.contactPerson || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs uppercase tracking-wider">Contact Phone</p>
                          <p className="text-gray-800 mt-1">{booking.contactPhone || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs uppercase tracking-wider">Pincode</p>
                          <p className="text-gray-800 mt-1">{booking.pincode || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                    {booking.address && (
                      <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-600 text-xs uppercase tracking-wider mb-2">Full Address</p>
                        <p className="text-gray-800">{booking.address}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => toggleDetails(booking._id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <span>{expandedDetails[booking._id] ? "Hide Details" : "View Details"}</span>
                    <span className="text-lg">{expandedDetails[booking._id] ? "▲" : "▼"}</span>
                  </button>
                  <a
                    href="/contact"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <span>📞</span> Contact Support
                  </a>
                  <button
                    onClick={() => downloadBookingReport(booking)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <span>📄</span> Download Report
                  </button>
                  {["Pending", "Cancelled"].includes(booking.status) && (
                    <button
                      onClick={() => setDeleteConfirm(booking._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <span>🗑️</span> Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Booking</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this booking? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteBooking(deleteConfirm)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        {bookings.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={fetchBookings}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition flex items-center justify-center gap-2 mx-auto"
            >
              <span>🔄</span> Refresh Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingStatus;
