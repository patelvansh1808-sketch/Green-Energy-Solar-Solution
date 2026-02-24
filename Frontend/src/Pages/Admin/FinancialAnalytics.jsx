import { useEffect, useMemo, useState } from "react";
import financeService from "../../services/financeService";
import LineChart from "../../Components/Charts/LineChart.jsx";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function FinancialAnalytics() {
  const [overview, setOverview] = useState(null);
  const [companyRoi, setCompanyRoi] = useState(null);
  const [costAnalysis, setCostAnalysis] = useState(null);
  const [report, setReport] = useState([]);
  const [profitability, setProfitability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    revenueType: "all",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        if (filters.revenueType) params.revenueType = filters.revenueType;
        const [overviewRes, reportRes, profitRes, roiRes, costRes] = await Promise.all([
          financeService.getOverview(params),
          financeService.getRevenueReport(params),
          financeService.getProfitability({ limit: 20, ...params }),
          financeService.getCompanyRoi(params),
          financeService.getInstallationCostAnalysis(params),
        ]);

        setOverview(overviewRes);
        setReport(reportRes.series || []);
        setProfitability(profitRes.data || []);
        setCompanyRoi(roiRes || null);
        setCostAnalysis(costRes || null);
        setError("");
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load financial analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.startDate, filters.endDate, filters.revenueType]);

  const handleExportRevenueCsv = () => {
    const header = [
      "Period",
      "Revenue",
      "InstallationRevenue",
      "MaintenanceRevenue",
      "Cost",
      "Profit",
      "MarginPercent",
      "Entries",
    ];
    const rows = report.map((r) => [
      r.period,
      r.revenue || 0,
      r.bookingRevenue || 0,
      r.maintenanceRevenue || 0,
      r.cost || 0,
      r.profit || 0,
      r.marginPercent || 0,
      r.count || 0,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "revenue-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const chartData = useMemo(() => {
    const safeReport = Array.isArray(report) ? report : [];
    const labels = safeReport.map((r) => r.period);
    const revenue = safeReport.map((r) => r.revenue || 0);
    const profit = safeReport.map((r) => r.profit || 0);
    return { labels, revenue, profit };
  }, [report]);

  const chartWidth = Math.max(600, chartData.labels.length * 80);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <p className="text-gray-600">Loading financial analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">💼 Financial & Revenue Analytics</h1>
          <p className="text-gray-600 mt-2">
            Company performance, profit margins, and revenue trends in one place.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Revenue Type</label>
              <select
                value={filters.revenueType}
                onChange={(e) => setFilters({ ...filters, revenueType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Revenue</option>
                <option value="maintenance">Maintenance Revenue Only</option>
                <option value="booking">Booking / Installation Revenue Only</option>
              </select>
            </div>
            <div>
              <button
                onClick={() => setFilters({ startDate: "", endDate: "", revenueType: "all" })}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
              >
                Reset Filters
              </button>
            </div>
            <div>
              <button
                onClick={handleExportRevenueCsv}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                ⬇️ Export Revenue CSV
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(overview.revenue?.totalRevenue)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Filter: {filters.revenueType === "maintenance"
                  ? "Maintenance only"
                  : filters.revenueType === "booking"
                    ? "Booking / Installation only"
                    : "All revenue streams"}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Booking / Installation Revenue</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {formatCurrency(overview.revenue?.installationRevenue)}
              </p>
              <p className="text-xs text-gray-400 mt-1">From completed installations</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
              <p className="text-sm text-gray-500">Maintenance Revenue</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {formatCurrency(overview.revenue?.maintenanceRevenue)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Paid maintenance subscriptions</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <p className="text-sm text-gray-500">Gross Profit & Margin</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {formatCurrency(overview.profit?.grossProfit)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Margin: {overview.profit?.marginPercent || 0}%
              </p>
            </div>
          </div>
        )}

        {overview && (
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <p className="text-sm text-gray-600">
              Pipeline Revenue (booking only): {formatCurrency(overview.revenue?.pipelineRevenue)}
            </p>
          </div>
        )}

        {/* Company ROI */}
        {companyRoi && filters.revenueType !== "maintenance" && (
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Company ROI (Completed)</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  {companyRoi.roi?.percent || 0}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Based on completed bookings: {companyRoi.totals?.completedBookings || 0}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500 space-y-1">
                <p>Revenue: {formatCurrency(companyRoi.totals?.totalRevenue)}</p>
                <p>Cost: {formatCurrency(companyRoi.totals?.totalCost)}</p>
                <p>Profit: {formatCurrency(companyRoi.totals?.profit)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Installation Cost Analysis */}
        {costAnalysis && filters.revenueType !== "maintenance" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">🧾 Installation Cost Analysis</h2>
              <span className="text-sm text-gray-500">
                Completed bookings: {costAnalysis.completedBookings || 0}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2">Total Cost by Category</p>
                <div className="h-64">
                  <LineChart
                    labels={["Equipment", "Labor", "Logistics", "Permits", "Overhead", "Other"]}
                    datasets={[
                      {
                        label: "Total Cost",
                        data: [
                          costAnalysis.totals?.equipment || 0,
                          costAnalysis.totals?.labor || 0,
                          costAnalysis.totals?.logistics || 0,
                          costAnalysis.totals?.permits || 0,
                          costAnalysis.totals?.overhead || 0,
                          costAnalysis.totals?.other || 0,
                        ],
                        borderColor: "#f97316",
                        backgroundColor: "rgba(249,115,22,0.15)",
                        pointBackgroundColor: "#f97316",
                        tension: 0.3,
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2">Average Cost per Project</p>
                <div className="space-y-3">
                  {[
                    { label: "Equipment", value: costAnalysis.average?.equipment },
                    { label: "Labor", value: costAnalysis.average?.labor },
                    { label: "Logistics", value: costAnalysis.average?.logistics },
                    { label: "Permits", value: costAnalysis.average?.permits },
                    { label: "Overhead", value: costAnalysis.average?.overhead },
                    { label: "Other", value: costAnalysis.average?.other },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{row.label}</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {formatCurrency(row.value || 0)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Total Cost</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(costAnalysis.average?.totalCost || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">📈 Revenue & Profit Trend</h2>
            <span className="text-sm text-gray-500">
              {filters.revenueType === "maintenance"
                ? "Paid maintenance subscriptions"
                : filters.revenueType === "booking"
                  ? "Completed bookings"
                  : "Bookings + maintenance"}
            </span>
          </div>
          {chartData.labels.length > 1 ? (
            <div className="border rounded-lg p-4">
              <div className="h-72 overflow-x-auto">
                <div style={{ width: chartWidth }} className="h-72">
                  <LineChart
                    labels={chartData.labels}
                    datasets={[
                      {
                        label: "Revenue",
                        data: chartData.revenue,
                        borderColor: "#2563eb",
                        backgroundColor: "rgba(37,99,235,0.15)",
                        pointBackgroundColor: "#2563eb",
                        tension: 0.3,
                      },
                      {
                        label: "Profit",
                        data: chartData.profit,
                        borderColor: "#16a34a",
                        backgroundColor: "rgba(22,163,74,0.15)",
                        pointBackgroundColor: "#16a34a",
                        tension: 0.3,
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          ) : chartData.labels.length === 1 ? (
            <div className="border rounded-lg p-6 bg-gray-50">
              <p className="text-sm text-gray-500 mb-2">Not enough trend data</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs text-gray-500">Period</p>
                  <p className="text-lg font-semibold text-gray-800">{chartData.labels[0]}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(chartData.revenue[0] || 0)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs text-gray-500">Profit</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(chartData.profit[0] || 0)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No report data available.</p>
          )}
        </div>

        {/* Profitability Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Project Profitability</h2>
          {profitability.length === 0 ? (
            <p className="text-gray-500">
              {filters.revenueType === "maintenance"
                ? "No paid maintenance revenue found."
                : filters.revenueType === "booking"
                  ? "No completed projects found."
                  : "No revenue entries found."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reference</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Source</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Plan / System</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Revenue</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cost</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Profit</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {profitability.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-blue-600 font-mono">
                        {row.bookingId || row.paymentId || row.id?.slice(-8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.entryType === "maintenance" ? "Maintenance" : "Booking"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.customer || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.entryType === "maintenance"
                          ? `${row.planType || "-"} Plan`
                          : `${row.systemType || "-"} • ${row.capacity || 0} kW`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatCurrency(row.revenue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatCurrency(row.cost)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatCurrency(row.profit)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                        {row.marginPercent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
