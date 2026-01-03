import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      const response = await api.get("/admin/bookings");
      setBookings(response.data);
      setError("");
      setLoading(false);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setError("Failed to load bookings");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
          {error}
          <button
            onClick={fetchBookings}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Bookings</h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-center">Connection Type</th>
              <th className="p-3 text-center">Location</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Date</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-semibold">
                    {booking.user?.name || "N/A"}
                  </td>
                  <td className="p-3 text-center">
                    {booking.connectionType || "N/A"}
                  </td>
                  <td className="p-3 text-center">
                    {booking.location || "N/A"}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status || "Pending"}
                    </span>
                  </td>
                  <td className="p-3 text-center text-gray-600">
                    {new Date(booking.createdAt).toLocaleDateString()}
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
