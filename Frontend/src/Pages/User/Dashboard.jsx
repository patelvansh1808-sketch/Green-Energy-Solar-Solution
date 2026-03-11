import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../Context/I18nContext";
import API from "../../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await API.get("/dashboard");
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
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
          <p className="mt-4 text-gray-600">{t("dashboard.loading")}</p>
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
            {t("dashboard.retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="text-center py-8">{t("dashboard.noDashboardData")}</div>;
  }

  const {
    user: userData = {},
    customer = {},
    energy = {},
    savings = {},
    roi = {},
    subsidy = null,
    alerts = { unresolvedCount: 0, recent: [] },
    system = {},
  } = dashboardData;

  const fmtNum = (n) => Number(n ?? 0).toLocaleString("en-IN");
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{t("dashboard.title")}</h1>
              <p className="text-gray-600 mt-2">
                {t("dashboard.welcomeBack", `Welcome back,` ).replace("{name}", userData.name )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/my-activity")}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition self-start"
            >
              My Activity
            </button>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Energy Generated */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{t("dashboard.totalGenerated")}</p>
                <p className="text-3xl font-bold text-green-600">{fmtNum(energy.totalGenerated)}</p>
                <p className="text-xs text-gray-400 mt-1">kWh ({t("dashboard.last30Days", "Last 30 days")})</p>
              </div>
              <span className="text-2xl font-bold text-green-600">EG</span>
            </div>
          </div>

          {/* Total Savings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{t("dashboard.totalSavings")}</p>
                <p className="text-3xl font-bold text-blue-600">₹{fmtNum(savings.total)}</p>
                <p className="text-xs text-gray-400 mt-1">{t("dashboard.costSaved", "Cost saved")}</p>
              </div>
              <span className="text-2xl font-bold text-blue-600">SV</span>
            </div>
          </div>

          {/* ROI */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{t("dashboard.roiEarned")}</p>
                <p className="text-3xl font-bold text-purple-600">{roi.percentage ?? 0}%</p>
                <p className="text-xs text-gray-400 mt-1">{t("dashboard.paybackIn", "Payback in")} {roi.paybackYears ?? "—"} {t("dashboard.years")}</p>
              </div>
              <span className="text-2xl font-bold text-purple-600">ROI</span>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{t("dashboard.systemStatus")}</p>
                <p className={`text-3xl font-bold ${system.status === "Online" ? "text-green-600" : "text-yellow-600"}`}>
                  {system.status ?? "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">{system.onlinePercentage ?? 0}% {t("dashboard.online", "online")}</p>
              </div>
              <span className="text-xl font-bold text-gray-700">{system.status === "Online" ? "ON" : "AL"}</span>
            </div>
          </div>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            {/* ENERGY DETAILS */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">{t("dashboard.energyDetails")}</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-gray-500 text-sm">{t("dashboard.monthlyAverage")}</p>
                  <p className="text-2xl font-bold text-green-600">{fmtNum(energy.averageDaily)} kWh</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">{t("dashboard.peakGeneration", "Peak Generation")}</p>
                  <p className="text-2xl font-bold text-blue-600">{fmtNum(energy.maxDaily)} kWh</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Data Points</p>
                  <p className="text-2xl font-bold text-purple-600">{fmtNum(energy.unitCount)} days</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded p-4">
                <p className="text-sm text-gray-600">
                  Your system has generated a total of <strong>{fmtNum(energy.totalGenerated)} kWh</strong> in the last 30 days.
                  This is equivalent to the annual electricity consumption of approximately{" "}
                  <strong>{((energy.totalGenerated ?? 0) / 5).toFixed(1)} households</strong>.
                </p>
              </div>
            </div>

            {/* SAVINGS BREAKDOWN */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">{t("dashboard.savingsBreakdown")}</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">{t("dashboard.energyGenerated", "Energy Generated")}</span>
                  <span className="font-bold">{fmtNum(energy.totalGenerated)} kWh</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">{t("dashboard.costPerUnit")}</span>
                  <span className="font-bold">₹{fmtNum(savings.costPerUnit)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b bg-green-50 p-3 rounded">
                  <span className="font-semibold">{t("dashboard.totalSavings")}</span>
                  <span className="text-2xl font-bold text-green-600">₹{fmtNum(savings.total)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-600">{t("dashboard.monthlyROI")}</span>
                  <span className="font-bold">₹{fmtNum(savings.monthlyAverage)}/month</span>
                </div>
              </div>
            </div>

            {/* ROI DETAILS */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">{t("dashboard.roiSection")}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">System Cost</p>
                  <p className="text-2xl font-bold text-blue-600">₹{fmtNum(roi.systemCost)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-gray-600 text-sm">{t("dashboard.currentROI")}</p>
                  <p className="text-2xl font-bold text-purple-600">{roi.percentage ?? 0}%</p>
                </div>
              </div>
              <div className="mt-4 bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">
                  {t("dashboard.paybackMessage", "Your system will pay for itself in approximately ")} <strong>{roi.paybackYears ?? "—"} {t("dashboard.years")}</strong> {t("dashboard.atCurrentRate", "at the current savings rate.")}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            {/* CUSTOMER INFO */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">{t("dashboard.systemInfo")}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-sm">{t("dashboard.capacity", "System Capacity")}</p>
                  <p className="font-bold">{customer.systemCapacity ?? "—"} kW</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">{t("profile.siteLocation")}</p>
                  <p className="font-bold">{customer.location ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">{t("profile.installationDate")}</p>
                  <p className="font-bold">{fmtDate(customer.installationDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">{t("dashboard.status", "Status")}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      customer.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {customer.status ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* SUBSIDY STATUS */}
            {subsidy && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">💵 {t("subsidy.statusTitle", "Subsidy Status")}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-500 text-sm">{t("profile.state", "State")}</p>
                    <p className="font-bold">{subsidy.state ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">{t("subsidy.status", "Status")}</p>
                    <p className="font-bold">{subsidy.eligibilityPercentage ?? 0}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Applied Amount</p>
                    <p className="font-bold">₹{fmtNum(subsidy.appliedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">{t("dashboard.status", "Status")}</p>
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                        subsidy.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : subsidy.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {subsidy.status ?? "—"}
                    </span>
                  </div>
                  {subsidy?.approvedAmount && (
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-gray-600 text-sm">{t("subsidy.approvedAmount", "Approved Amount")}</p>
                      <p className="text-xl font-bold text-green-600">
                        ₹{fmtNum(subsidy.approvedAmount)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ALERTS */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">
                {t("dashboard.alerts")} ({alerts.unresolvedCount ?? 0})
              </h3>
              {alerts.recent?.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">{t("dashboard.noAlerts")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.recent?.map((alert) => (
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
                        {fmtDate(alert.createdAt)}
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
                  {t("dashboard.seeMore")} →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}