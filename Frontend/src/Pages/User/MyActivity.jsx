import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import activityService from "../../services/activityService";

const MODULE_STYLES = {
  booking: "bg-blue-100 text-blue-700",
  subscription: "bg-emerald-100 text-emerald-700",
  maintenance: "bg-teal-100 text-teal-700",
  ticket: "bg-orange-100 text-orange-700",
  subsidy: "bg-purple-100 text-purple-700",
};

const moduleLabel = (module) => {
  const labels = {
    booking: "Booking",
    subscription: "Subscription",
    maintenance: "Maintenance",
    ticket: "Ticket",
    subsidy: "Subsidy",
  };
  return labels[module] || "Activity";
};

const formatDateTime = (value) => {
  const date = new Date(value);
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDateGroupLabel = (isoDate) => {
  const date = new Date(isoDate);
  const today = new Date();
  const diffMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()) - new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "This Week";
  if (diffDays <= 30) return "This Month";
  return "Older";
};

export default function MyActivity() {
  const { customerProfile } = useAuth();
  const [activityData, setActivityData] = useState({ events: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, totalItems: 0, totalPages: 1 });
  const [downloading, setDownloading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        const data = await activityService.getMyActivity({
          module: selectedModule,
          from: fromDate,
          to: toDate,
          page: currentPage,
          limit: 25,
        });
        setActivityData(data);
        setPagination(data.pagination || { page: 1, limit: 25, totalItems: 0, totalPages: 1 });
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load activity history");
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [customerProfile?._id, selectedModule, fromDate, toDate, currentPage]);

  const groupedEvents = useMemo(() => {
    return activityData.events.reduce((acc, event) => {
      const group = getDateGroupLabel(event.date);
      if (!acc[group]) acc[group] = [];
      acc[group].push(event);
      return acc;
    }, {});
  }, [activityData.events]);

  const changeModule = (value) => {
    setSelectedModule(value);
    setCurrentPage(1);
  };

  const clearDateFilters = () => {
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const toCsvCell = (value) => {
    const stringValue = String(value ?? "");
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const handleDownloadCsv = async () => {
    try {
      setDownloading(true);
      const exportData = await activityService.getMyActivity({
        module: selectedModule,
        from: fromDate,
        to: toDate,
        page: 1,
        limit: 1000,
      });

      const rows = Array.isArray(exportData?.events) ? exportData.events : [];
      if (!rows.length) {
        setError("No activity data available to download.");
        return;
      }

      const header = ["Date", "Module", "Title", "Description", "Status"];
      const csvRows = [header.map(toCsvCell).join(",")];

      rows.forEach((event) => {
        csvRows.push(
          [
            formatDateTime(event.date),
            moduleLabel(event.module),
            event.title,
            event.description,
            event.status || "",
          ]
            .map(toCsvCell)
            .join(",")
        );
      });

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const datePart = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `my-activity-${datePart}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to download activity data");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const exportData = await activityService.getMyActivity({
        module: selectedModule,
        from: fromDate,
        to: toDate,
        page: 1,
        limit: 1000,
      });

      const rows = Array.isArray(exportData?.events) ? exportData.events : [];
      if (!rows.length) {
        setError("No activity data available to download.");
        return;
      }

      const reportDate = new Date().toLocaleDateString("en-IN");
      const filterSummary = [
        `Module: ${selectedModule === "all" ? "All" : moduleLabel(selectedModule)}`,
        `From: ${fromDate || "-"}`,
        `To: ${toDate || "-"}`,
      ].join(" | ");

      const tableRows = rows
        .map(
          (event) => `
          <tr>
            <td>${formatDateTime(event.date)}</td>
            <td>${moduleLabel(event.module)}</td>
            <td>${event.title || ""}</td>
            <td>${event.description || ""}</td>
            <td>${event.status || ""}</td>
          </tr>
        `
        )
        .join("");

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>My Activity Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
              h1 { margin-bottom: 8px; }
              .meta { margin-bottom: 4px; color: #4b5563; font-size: 12px; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
              th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
              th { background: #f3f4f6; }
              @media print {
                body { margin: 8mm; }
                tr { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <h1>My Activity Report</h1>
            <div class="meta">Generated on: ${reportDate}</div>
            <div class="meta">${filterSummary}</div>
            <div class="meta">Total Records: ${rows.length}</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Module</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        setError("Popup blocked. Please allow popups to download PDF.");
        return;
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to download activity report");
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading your activity history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Activity</h1>
              <p className="text-gray-600 mt-2">Track all your actions across booking, subscriptions, maintenance, tickets, and subsidy.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadCsv}
                disabled={downloading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                {downloading ? "Downloading..." : "Download CSV"}
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="bg-slate-700 hover:bg-slate-800 disabled:opacity-60 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                {downloadingPdf ? "Preparing..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <SummaryCard label="Total" value={activityData.summary.total || 0} />
          <SummaryCard label="Booking" value={activityData.summary.booking || 0} />
          <SummaryCard label="Subscription" value={activityData.summary.subscription || 0} />
          <SummaryCard label="Maintenance" value={activityData.summary.maintenance || 0} />
          <SummaryCard label="Tickets" value={activityData.summary.ticket || 0} />
          <SummaryCard label="Subsidy" value={activityData.summary.subsidy || 0} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All" },
              { value: "booking", label: "Booking" },
              { value: "subscription", label: "Subscription" },
              { value: "maintenance", label: "Maintenance" },
              { value: "ticket", label: "Tickets" },
              { value: "subsidy", label: "Subsidy" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => changeModule(item.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
                  selectedModule === item.value
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={clearDateFilters}
              className="h-[40px] px-4 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear Dates
            </button>
          </div>
        </div>

        {activityData.events.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-600">
            No activity found for this selection.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([group, items]) => (
              <div key={group} className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{group}</h2>
                <div className="space-y-3">
                  {items.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${MODULE_STYLES[event.module] || "bg-gray-100 text-gray-700"}`}>
                            {moduleLabel(event.module)}
                          </span>
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        </div>
                        <span className="text-xs text-gray-500">{formatDateTime(event.date)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{event.description}</p>
                      {event.status && (
                        <p className="text-xs text-gray-500 mt-1">Status: {String(event.status)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} activities
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
