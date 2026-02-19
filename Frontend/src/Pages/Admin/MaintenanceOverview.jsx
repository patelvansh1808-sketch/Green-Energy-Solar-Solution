import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const cards = [
  {
    key: "totalSubscriptions",
    label: "Total Subscriptions",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    key: "activePlans",
    label: "Active Plans",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    key: "todaysServices",
    label: "Today’s Services",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  {
    key: "upcomingServices",
    label: "Upcoming Services",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  {
    key: "expiringSoon",
    label: "Expiring Soon",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
];

const defaultSettingsState = {
  planPricing: {
    oneMonth: { price: 999, taxPercent: 18, discountPercent: 0, isActive: true },
    sixMonths: { price: 4999, taxPercent: 18, discountPercent: 0, isActive: true },
    oneYear: { price: 8999, taxPercent: 18, discountPercent: 0, isActive: true },
    lifetime: { price: 24999, taxPercent: 18, discountPercent: 0, isActive: true },
  },
  numberOfVisitsPerPlan: {
    oneMonth: 1,
    sixMonths: 6,
    oneYear: 12,
    lifetime: 24,
    extraVisitCharge: 499,
    unusedVisitRule: "expire",
  },
  defaultServiceChecklist: {
    cleaning: [
      { item: "Panel surface cleaning", mandatory: true },
      { item: "Visual inspection of wiring", mandatory: true },
    ],
    testing: [
      { item: "Voltage output test", mandatory: true },
      { item: "Inverter performance test", mandatory: true },
    ],
    technicianNotesTemplate: "Summary of work done, observations, and customer confirmation.",
  },
  serviceFrequencyRules: {
    autoScheduleFrequency: "monthly",
    minimumGapDays: 20,
    rescheduleWindowDays: 7,
    graceDays: 3,
    holidayBlackoutHandling: "skip_to_next_available",
    blackoutDates: [],
  },
};

export default function MaintenanceOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [subsError, setSubsError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [selectedType, setSelectedType] = useState("totalSubscriptions");
  const [drilldown, setDrilldown] = useState({ entity: "plan", items: [] });
  const [drilldownLoading, setDrilldownLoading] = useState(false);
  const [drilldownError, setDrilldownError] = useState("");
  const [serviceView, setServiceView] = useState("list");
  const [serviceItems, setServiceItems] = useState([]);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [serviceError, setServiceError] = useState("");
  const [serviceActionLoadingId, setServiceActionLoadingId] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [activeTab, setActiveTab] = useState("operations");
  const [settingsData, setSettingsData] = useState(defaultSettingsState);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/maintenance/admin/overview");
      setStats(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load maintenance overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setSubsLoading(true);
      const query = new URLSearchParams({ limit: "50" });
      if (statusFilter && statusFilter !== "All") {
        query.append("status", statusFilter);
      }
      const res = await api.get(`/maintenance/admin/subscriptions?${query.toString()}`);
      setSubscriptions(Array.isArray(res.data.items) ? res.data.items : []);
      setSubsError("");
    } catch (err) {
      setSubsError(err.response?.data?.message || "Failed to load subscriptions");
    } finally {
      setSubsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const fetchServiceSchedule = useCallback(async () => {
    try {
      setServiceLoading(true);
      const res = await api.get("/maintenance/admin/services/schedule?limit=100");
      setServiceItems(Array.isArray(res.data.items) ? res.data.items : []);
      setServiceError("");
    } catch (err) {
      setServiceError(err.response?.data?.message || "Failed to load service scheduling");
    } finally {
      setServiceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServiceSchedule();
  }, [fetchServiceSchedule]);

  const fetchTechnicians = useCallback(async () => {
    try {
      const res = await api.get("/users/team-members");
      const teamMembers = Array.isArray(res.data?.data) ? res.data.data : [];
      const availableTechnicians = teamMembers.filter(
        (member) =>
          member.role === "engineer" ||
          member.role === "technician" ||
          member.role === "support"
      );
      setTechnicians(availableTechnicians);
    } catch (err) {
      setTechnicians([]);
      console.error("Failed to load technicians", err.response?.data || err.message);
    }
  }, []);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  const fetchServiceHistoryReports = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await api.get("/maintenance/admin/services/history?limit=200");
      setHistoryItems(Array.isArray(res.data?.items) ? res.data.items : []);
      setHistoryError("");
    } catch (err) {
      setHistoryError(err.response?.data?.message || "Failed to load service history reports");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServiceHistoryReports();
  }, [fetchServiceHistoryReports]);

  const fetchSettings = useCallback(async () => {
    try {
      setSettingsLoading(true);
      const res = await api.get("/maintenance/admin/settings");
      setSettingsData({ ...defaultSettingsState, ...(res.data || {}) });
      setSettingsError("");
    } catch (err) {
      setSettingsError(err.response?.data?.message || "Failed to load maintenance settings");
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateChecklistItem = (type, index, field, value) => {
    setSettingsData((prev) => {
      const list = Array.isArray(prev.defaultServiceChecklist?.[type])
        ? [...prev.defaultServiceChecklist[type]]
        : [];
      if (!list[index]) return prev;
      list[index] = { ...list[index], [field]: value };
      return {
        ...prev,
        defaultServiceChecklist: {
          ...prev.defaultServiceChecklist,
          [type]: list,
        },
      };
    });
  };

  const addChecklistItem = (type) => {
    setSettingsData((prev) => ({
      ...prev,
      defaultServiceChecklist: {
        ...prev.defaultServiceChecklist,
        [type]: [
          ...(Array.isArray(prev.defaultServiceChecklist?.[type])
            ? prev.defaultServiceChecklist[type]
            : []),
          { item: "", mandatory: false },
        ],
      },
    }));
  };

  const removeChecklistItem = (type, index) => {
    setSettingsData((prev) => {
      const list = Array.isArray(prev.defaultServiceChecklist?.[type])
        ? [...prev.defaultServiceChecklist[type]]
        : [];
      list.splice(index, 1);
      return {
        ...prev,
        defaultServiceChecklist: {
          ...prev.defaultServiceChecklist,
          [type]: list,
        },
      };
    });
  };

  const handleSaveSettings = async () => {
    try {
      setSettingsSaving(true);
      setSettingsError("");
      setSettingsSuccess("");
      await api.patch("/maintenance/admin/settings", settingsData);
      setSettingsSuccess("Maintenance settings saved successfully");
      setTimeout(() => setSettingsSuccess(""), 3000);
    } catch (err) {
      setSettingsError(err.response?.data?.message || "Failed to save maintenance settings");
    } finally {
      setSettingsSaving(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUserLabel = (item) => {
    const user = item?.userId || {};
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
    return user.name || fullName || user.email || "-";
  };

  const getPlanLabel = (planType) => {
    const map = {
      "1 Month": "1M",
      "6 Months": "6M",
      "1 Year": "1Y",
      Lifetime: "Lifetime",
    };
    return map[planType] || planType || "-";
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await api.get(`/maintenance/admin/subscriptions/${id}`);
      setSelectedSubscription(res.data);
    } catch (err) {
      setSubsError(err.response?.data?.message || "Failed to load subscription details");
    }
  };

  const runAction = async (id, action) => {
    try {
      setActionLoadingId(id);
      await api.patch(`/maintenance/admin/subscriptions/${id}/${action}`);
      await Promise.all([fetchOverview(), fetchSubscriptions()]);
      if (selectedSubscription?._id === id) {
        await handleViewDetails(id);
      }
    } catch (err) {
      setSubsError(err.response?.data?.message || `Failed to ${action} subscription`);
    } finally {
      setActionLoadingId("");
    }
  };

  const getServiceCustomerLabel = (item) => {
    const user = item?.userId || {};
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
    return user.name || fullName || user.email || "-";
  };

  const resolveFileUrl = (relativeOrAbsoluteUrl) => {
    if (!relativeOrAbsoluteUrl) return "";
    if (relativeOrAbsoluteUrl.startsWith("http://") || relativeOrAbsoluteUrl.startsWith("https://")) {
      return relativeOrAbsoluteUrl;
    }
    return `http://localhost:5000${relativeOrAbsoluteUrl}`;
  };

  const openBlobInNewTab = (blob) => {
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  };

  const downloadBlob = (blob, filename) => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  };

  const handleViewServiceReport = async (item) => {
    try {
      if (item.reportUrl) {
        const uploadedUrl = resolveFileUrl(item.reportUrl);
        window.open(uploadedUrl, "_blank", "noopener,noreferrer");
        return;
      }

      const res = await api.get(`/maintenance/admin/services/${item._id}/report-pdf`, {
        responseType: "blob",
      });
      openBlobInNewTab(new Blob([res.data], { type: "application/pdf" }));
    } catch (err) {
      setHistoryError(err.response?.data?.message || "Failed to view report");
    }
  };

  const handleDownloadServiceReport = async (item) => {
    try {
      if (item.reportUrl) {
        const uploadedUrl = resolveFileUrl(item.reportUrl);
        const link = document.createElement("a");
        link.href = uploadedUrl;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.download = `${item.reportTitle || `maintenance-service-${item._id}`}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }

      const res = await api.get(`/maintenance/admin/services/${item._id}/report-pdf`, {
        responseType: "blob",
      });
      downloadBlob(
        new Blob([res.data], { type: "application/pdf" }),
        `maintenance-service-${item._id}.pdf`
      );
    } catch (err) {
      setHistoryError(err.response?.data?.message || "Failed to download report");
    }
  };

  const updateServiceSchedule = async (id, payload) => {
    try {
      setServiceActionLoadingId(id);
      await api.patch(`/maintenance/admin/services/${id}/schedule`, payload);
      await Promise.all([fetchServiceSchedule(), fetchServiceHistoryReports()]);
    } catch (err) {
      setServiceError(err.response?.data?.message || "Failed to update service");
    } finally {
      setServiceActionLoadingId("");
    }
  };

  const handleServiceTechnicianChange = (id, technician) => {
    updateServiceSchedule(id, { technicianId: technician });
  };

  const getServiceTechnicianLabel = (item) => {
    const assigned = item?.technicianId || {};
    const fullName = [assigned.firstName, assigned.lastName].filter(Boolean).join(" ");
    return item?.technicianDisplay || fullName || assigned.name || item?.technician || "Unassigned";
  };

  const handleServiceDateChange = (id, dateValue) => {
    if (!dateValue) return;
    updateServiceSchedule(id, { date: dateValue });
  };

  const getCalendarGroups = () => {
    const groups = {};
    serviceItems.forEach((item) => {
      const key = formatDate(item.date);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    return groups;
  };

  const fetchDrilldown = useCallback(async (type) => {
    try {
      setDrilldownLoading(true);
      const res = await api.get(`/maintenance/admin/drilldown?type=${type}`);
      setDrilldown({
        entity: res.data.entity || "plan",
        items: Array.isArray(res.data.items) ? res.data.items : [],
      });
      setDrilldownError("");
    } catch (err) {
      setDrilldownError(
        err.response?.data?.message || "Failed to load drilldown data"
      );
    } finally {
      setDrilldownLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrilldown(selectedType);
  }, [selectedType, fetchDrilldown]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-600">Loading maintenance overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700 font-semibold">{error}</p>
        <button
          type="button"
          onClick={fetchOverview}
          className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Maintenance Overview</h1>
        <p className="text-gray-600 mt-1">Subscription and service snapshot for all customers</p>
      </div>

      <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
        <button
          type="button"
          onClick={() => setActiveTab("operations")}
          className={`px-4 py-2 text-sm rounded-md ${
            activeTab === "operations" ? "bg-white shadow text-gray-900" : "text-gray-600"
          }`}
        >
          Operations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 text-sm rounded-md ${
            activeTab === "settings" ? "bg-white shadow text-gray-900" : "text-gray-600"
          }`}
        >
          Maintenance Settings
        </button>
      </div>

      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Maintenance Settings</h2>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={settingsSaving || settingsLoading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                {settingsSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>

            {settingsLoading && <p className="text-gray-600">Loading settings...</p>}
            {!settingsLoading && settingsError && (
              <p className="text-red-600 font-medium mb-3">{settingsError}</p>
            )}
            {!settingsLoading && settingsSuccess && (
              <p className="text-emerald-600 font-medium mb-3">{settingsSuccess}</p>
            )}

            {!settingsLoading && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Plan Pricing</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b">
                          <th className="py-2 pr-4">Plan</th>
                          <th className="py-2 pr-4">Price</th>
                          <th className="py-2 pr-4">Tax %</th>
                          <th className="py-2 pr-4">Discount %</th>
                          <th className="py-2">Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["oneMonth", "1 Month"],
                          ["sixMonths", "6 Months"],
                          ["oneYear", "1 Year"],
                          ["lifetime", "Lifetime"],
                        ].map(([key, label]) => (
                          <tr key={key} className="border-b last:border-0">
                            <td className="py-3 pr-4 text-gray-900">{label}</td>
                            <td className="py-3 pr-4">
                              <input
                                type="number"
                                value={settingsData.planPricing?.[key]?.price ?? 0}
                                onChange={(e) =>
                                  setSettingsData((prev) => ({
                                    ...prev,
                                    planPricing: {
                                      ...prev.planPricing,
                                      [key]: {
                                        ...prev.planPricing[key],
                                        price: Number(e.target.value || 0),
                                      },
                                    },
                                  }))
                                }
                                className="w-28 border border-gray-300 rounded px-2 py-1"
                              />
                            </td>
                            <td className="py-3 pr-4">
                              <input
                                type="number"
                                value={settingsData.planPricing?.[key]?.taxPercent ?? 0}
                                onChange={(e) =>
                                  setSettingsData((prev) => ({
                                    ...prev,
                                    planPricing: {
                                      ...prev.planPricing,
                                      [key]: {
                                        ...prev.planPricing[key],
                                        taxPercent: Number(e.target.value || 0),
                                      },
                                    },
                                  }))
                                }
                                className="w-20 border border-gray-300 rounded px-2 py-1"
                              />
                            </td>
                            <td className="py-3 pr-4">
                              <input
                                type="number"
                                value={settingsData.planPricing?.[key]?.discountPercent ?? 0}
                                onChange={(e) =>
                                  setSettingsData((prev) => ({
                                    ...prev,
                                    planPricing: {
                                      ...prev.planPricing,
                                      [key]: {
                                        ...prev.planPricing[key],
                                        discountPercent: Number(e.target.value || 0),
                                      },
                                    },
                                  }))
                                }
                                className="w-20 border border-gray-300 rounded px-2 py-1"
                              />
                            </td>
                            <td className="py-3">
                              <input
                                type="checkbox"
                                checked={Boolean(settingsData.planPricing?.[key]?.isActive)}
                                onChange={(e) =>
                                  setSettingsData((prev) => ({
                                    ...prev,
                                    planPricing: {
                                      ...prev.planPricing,
                                      [key]: {
                                        ...prev.planPricing[key],
                                        isActive: e.target.checked,
                                      },
                                    },
                                  }))
                                }
                                className="w-4 h-4"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Number of Visits per Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      ["oneMonth", "1 Month Visits"],
                      ["sixMonths", "6 Months Visits"],
                      ["oneYear", "1 Year Visits"],
                      ["lifetime", "Lifetime Visits"],
                      ["extraVisitCharge", "Extra Visit Charge"],
                    ].map(([key, label]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                        <input
                          type="number"
                          value={settingsData.numberOfVisitsPerPlan?.[key] ?? 0}
                          onChange={(e) =>
                            setSettingsData((prev) => ({
                              ...prev,
                              numberOfVisitsPerPlan: {
                                ...prev.numberOfVisitsPerPlan,
                                [key]: Number(e.target.value || 0),
                              },
                            }))
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unused Visits Rule</label>
                      <select
                        value={settingsData.numberOfVisitsPerPlan?.unusedVisitRule || "expire"}
                        onChange={(e) =>
                          setSettingsData((prev) => ({
                            ...prev,
                            numberOfVisitsPerPlan: {
                              ...prev.numberOfVisitsPerPlan,
                              unusedVisitRule: e.target.value,
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="carry_forward">Carry Forward</option>
                        <option value="expire">Expire</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Default Service Checklist</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[
                      ["cleaning", "Cleaning Checklist"],
                      ["testing", "Testing Checklist"],
                    ].map(([type, title]) => (
                      <div key={type} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">{title}</h4>
                          <button
                            type="button"
                            onClick={() => addChecklistItem(type)}
                            className="px-2.5 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm"
                          >
                            Add Item
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(settingsData.defaultServiceChecklist?.[type] || []).map((entry, index) => (
                            <div key={`${type}-${index}`} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={Boolean(entry.mandatory)}
                                onChange={(e) =>
                                  updateChecklistItem(type, index, "mandatory", e.target.checked)
                                }
                                className="w-4 h-4"
                                title="Mandatory"
                              />
                              <input
                                type="text"
                                value={entry.item || ""}
                                onChange={(e) =>
                                  updateChecklistItem(type, index, "item", e.target.value)
                                }
                                className="flex-1 border border-gray-300 rounded px-2 py-1"
                                placeholder="Checklist item"
                              />
                              <button
                                type="button"
                                onClick={() => removeChecklistItem(type, index)}
                                className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Technician Notes Template
                    </label>
                    <textarea
                      rows={3}
                      value={settingsData.defaultServiceChecklist?.technicianNotesTemplate || ""}
                      onChange={(e) =>
                        setSettingsData((prev) => ({
                          ...prev,
                          defaultServiceChecklist: {
                            ...prev.defaultServiceChecklist,
                            technicianNotesTemplate: e.target.value,
                          },
                        }))
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Frequency Rules</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Auto Schedule Frequency</label>
                      <select
                        value={settingsData.serviceFrequencyRules?.autoScheduleFrequency || "monthly"}
                        onChange={(e) =>
                          setSettingsData((prev) => ({
                            ...prev,
                            serviceFrequencyRules: {
                              ...prev.serviceFrequencyRules,
                              autoScheduleFrequency: e.target.value,
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="half_yearly">Half-Yearly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Gap (Days)</label>
                      <input
                        type="number"
                        value={settingsData.serviceFrequencyRules?.minimumGapDays ?? 0}
                        onChange={(e) =>
                          setSettingsData((prev) => ({
                            ...prev,
                            serviceFrequencyRules: {
                              ...prev.serviceFrequencyRules,
                              minimumGapDays: Number(e.target.value || 0),
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reschedule Window (Days)</label>
                      <input
                        type="number"
                        value={settingsData.serviceFrequencyRules?.rescheduleWindowDays ?? 0}
                        onChange={(e) =>
                          setSettingsData((prev) => ({
                            ...prev,
                            serviceFrequencyRules: {
                              ...prev.serviceFrequencyRules,
                              rescheduleWindowDays: Number(e.target.value || 0),
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grace Days</label>
                      <input
                        type="number"
                        value={settingsData.serviceFrequencyRules?.graceDays ?? 0}
                        onChange={(e) =>
                          setSettingsData((prev) => ({
                            ...prev,
                            serviceFrequencyRules: {
                              ...prev.serviceFrequencyRules,
                              graceDays: Number(e.target.value || 0),
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Holiday/Blackout Handling</label>
                      <select
                        value={settingsData.serviceFrequencyRules?.holidayBlackoutHandling || "skip_to_next_available"}
                        onChange={(e) =>
                          setSettingsData((prev) => ({
                            ...prev,
                            serviceFrequencyRules: {
                              ...prev.serviceFrequencyRules,
                              holidayBlackoutHandling: e.target.value,
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="skip_to_next_available">Skip to Next Available</option>
                        <option value="manual_approval">Manual Approval</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blackout Dates (comma separated YYYY-MM-DD)</label>
                      <input
                        type="text"
                        value={(settingsData.serviceFrequencyRules?.blackoutDates || []).join(", ")}
                        onChange={(e) =>
                          setSettingsData((prev) => ({
                            ...prev,
                            serviceFrequencyRules: {
                              ...prev.serviceFrequencyRules,
                              blackoutDates: e.target.value
                                .split(",")
                                .map((value) => value.trim())
                                .filter(Boolean),
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "operations" && (
        <>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <button
            type="button"
            key={card.key}
            onClick={() => setSelectedType(card.key)}
            className={`rounded-xl border p-5 text-left transition hover:shadow ${card.bg} ${card.border} ${
              selectedType === card.key ? "ring-2 ring-orange-300" : ""
            }`}
          >
            <p className="text-sm font-semibold text-gray-700">{card.label}</p>
            <p className={`text-3xl font-bold mt-3 ${card.color}`}>
              {stats?.[card.key] ?? 0}
            </p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Service Scheduling</h2>
          <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
            <button
              type="button"
              onClick={() => setServiceView("list")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                serviceView === "list" ? "bg-white shadow text-gray-900" : "text-gray-600"
              }`}
            >
              List View
            </button>
            <button
              type="button"
              onClick={() => setServiceView("calendar")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                serviceView === "calendar" ? "bg-white shadow text-gray-900" : "text-gray-600"
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>

        {serviceLoading && <p className="text-gray-600">Loading service schedule...</p>}
        {!serviceLoading && serviceError && <p className="text-red-600 font-medium">{serviceError}</p>}
        {!serviceLoading && !serviceError && serviceItems.length === 0 && (
          <p className="text-gray-600">No services scheduled</p>
        )}

        {!serviceLoading && !serviceError && serviceItems.length > 0 && serviceView === "list" && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Assigned Technician</th>
                  <th className="py-2 pr-4">Service Type</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {serviceItems.map((item) => (
                  <tr key={item._id} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-gray-900">{formatDate(item.date)}</td>
                    <td className="py-3 pr-4 text-gray-700">{getServiceCustomerLabel(item)}</td>
                    <td className="py-3 pr-4 text-gray-700">{item.location || "-"}</td>
                    <td className="py-3 pr-4 text-gray-700">{getServiceTechnicianLabel(item)}</td>
                    <td className="py-3 pr-4 text-gray-700">{item.type || "-"}</td>
                    <td className="py-3">
                      <div className="flex flex-col gap-2 min-w-[220px]">
                        <select
                          value={item.technicianId?._id || item.technicianId || ""}
                          onChange={(event) =>
                            handleServiceTechnicianChange(item._id, event.target.value)
                          }
                          disabled={serviceActionLoadingId === item._id}
                          className="px-2.5 py-1.5 rounded border border-gray-300 text-sm bg-white"
                        >
                          <option value="">Assign / Reassign Technician</option>
                          {technicians.map((tech) => {
                            const displayName =
                              [tech.firstName, tech.lastName].filter(Boolean).join(" ") ||
                              tech.name ||
                              tech.email;
                            return (
                              <option key={tech._id} value={tech._id}>
                                {displayName}
                              </option>
                            );
                          })}
                        </select>
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            defaultValue={item.date ? new Date(item.date).toISOString().split("T")[0] : ""}
                            onChange={(event) => handleServiceDateChange(item._id, event.target.value)}
                            disabled={serviceActionLoadingId === item._id}
                            className="px-2.5 py-1.5 rounded border border-gray-300 text-sm"
                          />
                          <span className="text-xs text-gray-500">Change Date</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!serviceLoading && !serviceError && serviceItems.length > 0 && serviceView === "calendar" && (
          <div className="space-y-4">
            {Object.entries(getCalendarGroups()).map(([day, items]) => (
              <div key={day} className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">{day}</p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item._id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-gray-50 rounded px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{getServiceCustomerLabel(item)}</p>
                        <p className="text-xs text-gray-600">{item.location || "-"}</p>
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">{item.type}</span>
                        <span className="mx-2">•</span>
                        <span>{getServiceTechnicianLabel(item)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Subscription Management</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="subscription-status-filter" className="text-sm text-gray-600 font-medium">
              Status
            </label>
            <select
              id="subscription-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Expired">Expired</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {subsLoading && <p className="text-gray-600">Loading subscriptions...</p>}
        {!subsLoading && subsError && <p className="text-red-600 font-medium">{subsError}</p>}
        {!subsLoading && !subsError && subscriptions.length === 0 && (
          <p className="text-gray-600">No subscriptions found</p>
        )}

        {!subsLoading && !subsError && subscriptions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Customer Name</th>
                  <th className="py-2 pr-4">Plan Type</th>
                  <th className="py-2 pr-4">Start Date</th>
                  <th className="py-2 pr-4">End Date</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((item) => (
                  <tr key={item._id} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-gray-900">{getUserLabel(item)}</td>
                    <td className="py-3 pr-4 text-gray-700">{getPlanLabel(item.planType)}</td>
                    <td className="py-3 pr-4 text-gray-700">{formatDate(item.startDate)}</td>
                    <td className="py-3 pr-4 text-gray-700">{formatDate(item.endDate)}</td>
                    <td className="py-3 pr-4 text-gray-700">{item.status || "-"}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(item._id)}
                          className="px-2.5 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          View Details
                        </button>
                        {item.status === "Active" ? (
                          <button
                            type="button"
                            onClick={() => runAction(item._id, "pause")}
                            disabled={actionLoadingId === item._id}
                            className="px-2.5 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-60"
                          >
                            Pause
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => runAction(item._id, "resume")}
                            disabled={actionLoadingId === item._id}
                            className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 disabled:opacity-60"
                          >
                            Resume
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => runAction(item._id, "renew")}
                          disabled={actionLoadingId === item._id}
                          className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-60"
                        >
                          Renew
                        </button>
                        <button
                          type="button"
                          onClick={() => runAction(item._id, "cancel")}
                          disabled={actionLoadingId === item._id || item.status === "Cancelled"}
                          className="px-2.5 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedSubscription && (
          <div className="mt-5 p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Subscription Details</h3>
              <button
                type="button"
                onClick={() => setSelectedSubscription(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
              <p><span className="font-semibold">Customer:</span> {getUserLabel(selectedSubscription)}</p>
              <p><span className="font-semibold">Plan:</span> {selectedSubscription.planType || "-"}</p>
              <p><span className="font-semibold">Status:</span> {selectedSubscription.status || "-"}</p>
              <p><span className="font-semibold">Services:</span> {(selectedSubscription.servicesUsed ?? 0)} / {(selectedSubscription.servicesTotal ?? 0)}</p>
              <p><span className="font-semibold">Start:</span> {formatDate(selectedSubscription.startDate)}</p>
              <p><span className="font-semibold">End:</span> {formatDate(selectedSubscription.endDate)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Service History & Reports</h2>
        </div>

        {historyLoading && <p className="text-gray-600">Loading service history...</p>}
        {!historyLoading && historyError && <p className="text-red-600 font-medium">{historyError}</p>}
        {!historyLoading && !historyError && historyItems.length === 0 && (
          <p className="text-gray-600">No service history found</p>
        )}

        {!historyLoading && !historyError && historyItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Service Date</th>
                  <th className="py-2 pr-4">Work Done</th>
                  <th className="py-2 pr-4">Technician</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyItems.map((item) => {
                  return (
                    <tr key={item._id} className="border-b last:border-0">
                      <td className="py-3 pr-4 text-gray-900">{item.customer || "-"}</td>
                      <td className="py-3 pr-4 text-gray-700">{formatDate(item.serviceDate)}</td>
                      <td className="py-3 pr-4 text-gray-700 max-w-[320px] truncate" title={item.workDone || "-"}>
                        {item.workDone || "-"}
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{item.technician || "-"}</td>
                      <td className="py-3 pr-4 text-gray-700">{item.status || "-"}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewServiceReport(item)}
                            className="px-2.5 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            View Report
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadServiceReport(item)}
                            className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                          >
                            Download PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {cards.find((card) => card.key === selectedType)?.label || "Details"}
        </h2>

        {drilldownLoading && <p className="text-gray-600">Loading details...</p>}
        {!drilldownLoading && drilldownError && (
          <p className="text-red-600 font-medium">{drilldownError}</p>
        )}

        {!drilldownLoading && !drilldownError && drilldown.items.length === 0 && (
          <p className="text-gray-600">No records found</p>
        )}

        {!drilldownLoading && !drilldownError && drilldown.items.length > 0 && (
          <div className="overflow-x-auto">
            {drilldown.entity === "plan" ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Plan</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Services Used</th>
                    <th className="py-2">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {drilldown.items.map((item) => (
                    <tr key={item._id} className="border-b last:border-0">
                      <td className="py-3 pr-4 text-gray-900">{getUserLabel(item)}</td>
                      <td className="py-3 pr-4 text-gray-700">{item.planType || "-"}</td>
                      <td className="py-3 pr-4 text-gray-700">{item.status || "-"}</td>
                      <td className="py-3 pr-4 text-gray-700">
                        {(item.servicesUsed ?? 0)} / {(item.servicesTotal ?? 0)}
                      </td>
                      <td className="py-3 text-gray-700">{formatDate(item.endDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Technician</th>
                  </tr>
                </thead>
                <tbody>
                  {drilldown.items.map((item) => (
                    <tr key={item._id} className="border-b last:border-0">
                      <td className="py-3 pr-4 text-gray-900">{getUserLabel(item)}</td>
                      <td className="py-3 pr-4 text-gray-700">{formatDate(item.date)}</td>
                      <td className="py-3 pr-4 text-gray-700">{item.type || "-"}</td>
                      <td className="py-3 pr-4 text-gray-700">{item.status || "-"}</td>
                      <td className="py-3 text-gray-700">{item.technician || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
