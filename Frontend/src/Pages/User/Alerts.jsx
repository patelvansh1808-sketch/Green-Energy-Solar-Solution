import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function Alerts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("unresolved");

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const resolved = filter === "all" ? "all" : filter === "unresolved" ? "false" : "true";
      const response = await API.get(`/dashboard/alerts?resolved=${resolved}&limit=50`);
      setAlerts(response.data.alerts);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch alerts");
      console.error("Fetch alerts error:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleResolve = async (alertId) => {
    try {
      await API.patch(`/dashboard/alerts/${alertId}/resolve`);
      
      // Remove from list or refresh
      setAlerts(alerts.filter((a) => a._id !== alertId));
      
      // Show success message
      alert("Alert marked as resolved");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-400 text-red-900";
      case "high":
        return "bg-orange-50 border-orange-400 text-orange-900";
      case "medium":
        return "bg-yellow-50 border-yellow-400 text-yellow-900";
      default:
        return "bg-blue-50 border-blue-400 text-blue-900";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return "🔴";
      case "high":
        return "🟠";
      case "medium":
        return "🟡";
      default:
        return "🔵";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">System Alerts</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage system alerts and notifications
          </p>
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded transition ${
                filter === "all"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setFilter("unresolved")}
              className={`px-4 py-2 rounded transition ${
                filter === "unresolved"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Unresolved
            </button>
            <button
              onClick={() => setFilter("resolved")}
              className={`px-4 py-2 rounded transition ${
                filter === "resolved"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading alerts...</p>
            </div>
          </div>
        )}

        {/* ALERTS LIST */}
        {!loading && alerts.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No alerts found</p>
            <p className="text-gray-400 mt-2">
              {filter === "unresolved"
                ? "Great! You have no unresolved alerts"
                : "No alerts to display"}
            </p>
          </div>
        )}

        {!loading && alerts.length > 0 && (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className={`border-l-4 p-6 rounded-lg bg-white shadow hover:shadow-md transition ${getSeverityColor(
                  alert.severity
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-3xl">{getSeverityIcon(alert.severity)}</span>
                    <div>
                      <h3 className="text-lg font-bold">{alert.title}</h3>
                      <p className="mt-2 text-gray-700">{alert.message}</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-600">
                        <span>Type: <strong>{alert.type}</strong></span>
                        <span>Severity: <strong className="uppercase">{alert.severity}</strong></span>
                        <span>
                          {new Date(alert.createdAt).toLocaleDateString()} at{" "}
                          {new Date(alert.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      {alert.isResolved && alert.resolvedAt && (
                        <div className="mt-3 text-sm text-green-600">
                          ✅ Resolved on {new Date(alert.resolvedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {!alert.isResolved && (
                    <button
                      onClick={() => handleResolve(alert._id)}
                      className="ml-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition whitespace-nowrap"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BACK BUTTON */}
        <div className="mt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
