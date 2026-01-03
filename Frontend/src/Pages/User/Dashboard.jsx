import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchDashboard();
  }, [user, navigate, fetchDashboard]);

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="text-center py-8">No dashboard data available</div>;
  }

  const { user: userData, customer, energy, savings, roi, subsidy, alerts, system } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {userData.name}! Here's your solar system performance.
          </p>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Energy Generated */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Energy Generated</p>
                <p className="text-3xl font-bold text-green-600">{energy.totalGenerated}</p>
                <p className="text-xs text-gray-400 mt-1">kWh (Last 30 days)</p>
              </div>
              <span className="text-4xl">⚡</span>
            </div>
          </div>

          {/* Total Savings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Savings</p>
                <p className="text-3xl font-bold text-blue-600">₹{savings.total}</p>
                <p className="text-xs text-gray-400 mt-1">Cost saved</p>
              </div>
              <span className="text-4xl">💰</span>
            </div>
          </div>

          {/* ROI */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">ROI</p>
                <p className="text-3xl font-bold text-purple-600">{roi.percentage}%</p>
                <p className="text-xs text-gray-400 mt-1">Payback in {roi.paybackYears} years</p>
              </div>
              <span className="text-4xl">📈</span>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">System Status</p>
                <p className={`text-3xl font-bold ${system.status === "Online" ? "text-green-600" : "text-yellow-600"}`}>
                  {system.status}
                </p>
                <p className="text-xs text-gray-400 mt-1">{system.onlinePercentage}% online</p>
              </div>
              <span className="text-4xl">{system.status === "Online" ? "✅" : "⚠️"}</span>
            </div>
          </div>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            {/* ENERGY DETAILS */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">⚡ Energy Generation</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-gray-500 text-sm">Average Daily</p>
                  <p className="text-2xl font-bold text-green-600">{energy.averageDaily} kWh</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Peak Generation</p>
                  <p className="text-2xl font-bold text-blue-600">{energy.maxDaily} kWh</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Data Points</p>
                  <p className="text-2xl font-bold text-purple-600">{energy.unitCount} days</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded p-4">
                <p className="text-sm text-gray-600">
                  Your system has generated a total of <strong>{energy.totalGenerated} kWh</strong> in the last 30 days.
                  This is equivalent to the annual electricity consumption of approximately{" "}
                  <strong>{(energy.totalGenerated / 5).toFixed(1)} households</strong>.
                </p>
              </div>
            </div>

            {/* SAVINGS BREAKDOWN */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">💰 Savings Breakdown</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Energy Generated</span>
                  <span className="font-bold">{energy.totalGenerated} kWh</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Cost per Unit</span>
                  <span className="font-bold">₹{savings.costPerUnit}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b bg-green-50 p-3 rounded">
                  <span className="font-semibold">Total Savings</span>
                  <span className="text-2xl font-bold text-green-600">₹{savings.total}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-600">Monthly Average</span>
                  <span className="font-bold">₹{savings.monthlyAverage}/month</span>
                </div>
              </div>
            </div>

            {/* ROI DETAILS */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">📈 Return on Investment</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">System Cost</p>
                  <p className="text-2xl font-bold text-blue-600">₹{roi.systemCost.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">Current ROI</p>
                  <p className="text-2xl font-bold text-purple-600">{roi.percentage}%</p>
                </div>
              </div>
              <div className="mt-4 bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">
                  Your system will pay for itself in approximately <strong>{roi.paybackYears} years</strong> at the current savings rate.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            {/* CUSTOMER INFO */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">🏠 System Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-sm">System Capacity</p>
                  <p className="font-bold">{customer.systemCapacity} kW</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Location</p>
                  <p className="font-bold">{customer.location}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Installation Date</p>
                  <p className="font-bold">
                    {new Date(customer.installationDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      customer.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {customer.status}
                  </span>
                </div>
              </div>
            </div>

            {/* SUBSIDY STATUS */}
            {subsidy && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">💵 Subsidy Status</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-500 text-sm">State</p>
                    <p className="font-bold">{subsidy.state}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Eligibility</p>
                    <p className="font-bold">{subsidy.eligibilityPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Applied Amount</p>
                    <p className="font-bold">₹{subsidy.appliedAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                        subsidy.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : subsidy.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {subsidy.status}
                    </span>
                  </div>
                  {subsidy.approvedAmount && (
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-gray-600 text-sm">Approved Amount</p>
                      <p className="text-xl font-bold text-green-600">
                        ₹{subsidy.approvedAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ALERTS */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">
                ⚠️ Recent Alerts ({alerts.unresolvedCount})
              </h3>
              {alerts.recent.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">No alerts</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.recent.map((alert) => (
                    <div
                      key={alert._id}
                      className={`p-3 rounded border-l-4 ${
                        alert.severity === "critical"
                          ? "bg-red-50 border-red-400"
                          : alert.severity === "high"
                          ? "bg-orange-50 border-orange-400"
                          : alert.severity === "medium"
                          ? "bg-yellow-50 border-yellow-400"
                          : "bg-blue-50 border-blue-400"
                      }`}
                    >
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {alerts.unresolvedCount > 0 && (
                <button
                  onClick={() => navigate("/dashboard/alerts")}
                  className="mt-4 w-full bg-orange-100 text-orange-700 py-2 rounded hover:bg-orange-200 transition text-sm font-semibold"
                >
                  View All Alerts →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
