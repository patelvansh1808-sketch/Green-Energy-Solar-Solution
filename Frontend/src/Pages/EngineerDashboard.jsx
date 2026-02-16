import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import projectService from "../services/projectService";
import inventoryService from "../services/inventoryService";

export default function EngineerDashboard() {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateType, setUpdateType] = useState(""); // "survey", "installation", "testing", "go_live"
  const [updateData, setUpdateData] = useState({});
  const [inventoryOptions, setInventoryOptions] = useState({
    panel: [],
    inverter: [],
    meter: [],
    spare: [],
  });
  const [inventorySelection, setInventorySelection] = useState({
    panel: { itemId: "", quantity: 0 },
    inverter: { itemId: "", quantity: 0 },
    meter: { itemId: "", quantity: 0 },
    spare: { itemId: "", quantity: 0 },
  });
  const [submitting, setSubmitting] = useState(false);
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [goLiveData, setGoLiveData] = useState({});

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchMyProjects = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch projects assigned to this engineer
      const data = await projectService.getAllProjects({ 
        engineerId: user._id 
      });
      setMyProjects(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);

  const openDetailModal = (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const openUpdateModal = async (project, type) => {
    setSelectedProject(project);
    setUpdateType(type);
    setShowDetailModal(false);
    setShowUpdateModal(true);

    if (type === "survey") {
      setUpdateData({
        surveyDate: project.siteSurvey?.surveyDate
          ? new Date(project.siteSurvey.surveyDate).toISOString().split("T")[0]
          : "",
        roofCondition: project.siteSurvey?.roofCondition || "",
        roofType: project.siteSurvey?.roofType || "",
        roofSize: project.siteSurvey?.roofSize || "",
        sunExposure: project.siteSurvey?.sunExposure || "",
        notes: project.siteSurvey?.notes || "",
      });
    } else if (type === "installation") {
      setUpdateData({
        status: project.installation?.status || "in_progress",
        progress: project.installation?.progress || 0,
        startDate: project.installation?.startDate
          ? new Date(project.installation.startDate).toISOString().split("T")[0]
          : "",
        actualCompletionDate: "",
        notes: project.installation?.notes || "",
      });
    } else if (type === "testing") {
      setUpdateData({
        status: project.testing?.status || "in_progress",
        notes: project.testing?.notes || "",
      });
    }
  };

  const openGoLiveModal = (project) => {
    setSelectedProject(project);
    setShowGoLiveModal(true);
    setShowDetailModal(false);
    setGoLiveData({});
  };

  const handleGoLiveSubmit = async () => {
    try {
      setSubmitting(true);
      await projectService.goLiveConfirmation(selectedProject._id, goLiveData);
      await fetchMyProjects();
      setShowGoLiveModal(false);
      setGoLiveData({});
      alert("Project confirmed for Go-Live! ✅");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm go-live");
    } finally {
      setSubmitting(false);
    }
  };

  const loadInventoryOptions = async () => {
    const items = await inventoryService.getItems({ status: "active" });
    const grouped = { panel: [], inverter: [], meter: [], spare: [] };
    items.forEach((item) => {
      if (grouped[item.category]) grouped[item.category].push(item);
    });
    setInventoryOptions(grouped);
  };

  const applyAutoFillSelection = (project) => {
    const capacity = Number(project?.systemCapacity || 0);
    setInventorySelection((prev) => ({
      panel: { ...prev.panel, quantity: Math.ceil(capacity * 2) },
      inverter: { ...prev.inverter, quantity: 1 },
      meter: { ...prev.meter, quantity: 1 },
      spare: { ...prev.spare, quantity: 1 },
    }));
  };

  const openInventoryModal = async (project) => {
    setSelectedProject(project);
    await loadInventoryOptions();

    const initial = {
      panel: { itemId: "", quantity: 0 },
      inverter: { itemId: "", quantity: 0 },
      meter: { itemId: "", quantity: 0 },
      spare: { itemId: "", quantity: 0 },
    };

    const hasSavedSelection =
      Array.isArray(project.inventorySelection) && project.inventorySelection.length > 0;

    if (hasSavedSelection) {
      project.inventorySelection.forEach((sel) => {
        if (initial[sel.category]) {
          initial[sel.category] = {
            itemId: sel.itemId || "",
            quantity: sel.quantity || 0,
          };
        }
      });
    }

    setInventorySelection(initial);
    if (!hasSavedSelection) {
      applyAutoFillSelection(project);
    }
    setShowInventoryModal(true);
  };

  const handleSaveInventorySelection = async () => {
    if (!selectedProject) return;
    try {
      const selections = Object.entries(inventorySelection)
        .map(([category, val]) => ({
          category,
          itemId: val.itemId,
          quantity: Number(val.quantity || 0),
        }))
        .filter((s) => s.itemId && s.quantity > 0);

      const updated = await projectService.updateInventorySelection(
        selectedProject._id,
        { selections, issueNow: true }
      );
      setSelectedProject(updated);
      setShowInventoryModal(false);
      await fetchMyProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save inventory selection");
    }
  };

  const handleUpdateSubmit = async () => {
    try {
      setSubmitting(true);
      
      if (updateType === "survey") {
        await projectService.updateSiteSurvey(selectedProject._id, updateData);
      } else if (updateType === "installation") {
        await projectService.updateInstallation(selectedProject._id, updateData);
      } else if (updateType === "testing") {
        await projectService.updateTesting(selectedProject._id, updateData);
      }
      
      // Refresh projects
      await fetchMyProjects();
      setShowUpdateModal(false);
      setUpdateData({});
      alert(`${updateType.charAt(0).toUpperCase() + updateType.slice(1)} updated successfully!`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update project");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      survey: "🔍 Site Survey",
      engineer_assigned: "👨‍💼 Engineer Assigned",
      installation: "🔧 Installation",
      testing: "✅ Testing & Commissioning",
      go_live: "🚀 Go-Live",
      completed: "✔️ Completed",
      on_hold: "⏸️ On Hold",
      cancelled: "❌ Cancelled",
    };
    return labels[status] || status;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      survey: "bg-yellow-100 text-yellow-800",
      engineer_assigned: "bg-purple-100 text-purple-800",
      installation: "bg-blue-100 text-blue-800",
      testing: "bg-orange-100 text-orange-800",
      go_live: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      on_hold: "bg-red-100 text-red-800",
      cancelled: "bg-red-200 text-red-900",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getMyTasksCount = () => {
    return {
      total: myProjects.length,
      survey: myProjects.filter(p => p.status === "survey").length,
      installation: myProjects.filter(p => p.status === "installation").length,
      testing: myProjects.filter(p => p.status === "testing").length,
      completed: myProjects.filter(p => p.status === "completed").length,
    };
  };

  const filteredProjects = myProjects.filter(project => {
    if (statusFilter === "all") return true;
    return project.status === statusFilter;
  });

  const stats = getMyTasksCount();

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading your tasks...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">👷 Engineer Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Here are your assigned projects.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg p-4 mb-6">{error}</div>}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Projects</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-yellow-700">{stats.survey}</div>
            <div className="text-sm text-gray-600">Pending Survey</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-700">{stats.installation}</div>
            <div className="text-sm text-gray-600">In Installation</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-orange-700">{stats.testing}</div>
            <div className="text-sm text-gray-600">In Testing</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Projects</option>
            <option value="survey">Site Survey</option>
            <option value="engineer_assigned">Engineer Assigned</option>
            <option value="installation">Installation</option>
            <option value="testing">Testing & Commissioning</option>
            <option value="go_live">Go-Live</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Projects List */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">My Assigned Projects ({filteredProjects.length})</h2>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              {statusFilter === "all" 
                ? "No projects assigned to you yet" 
                : `No projects with status "${getStatusLabel(statusFilter)}"`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <tr key={project._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{project.projectName}</p>
                          <p className="text-sm text-gray-600">{project.location?.city}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{project.customerName}</p>
                          <p className="text-sm text-gray-600">{project.customerEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{project.systemCapacity} kW</p>
                          <p className="text-gray-600">{project.panelCount} panels</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${
                          project.priority === 'urgent' ? 'text-red-600' :
                          project.priority === 'high' ? 'text-orange-600' :
                          project.priority === 'normal' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openDetailModal(project)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded text-sm font-semibold transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* PROJECT DETAIL MODAL */}
      {showDetailModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedProject.projectName}</h2>
                <p className="text-gray-600 mt-1">{selectedProject.description}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-2xl text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Status */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Status</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(selectedProject.status)}`}>
                  {getStatusLabel(selectedProject.status)}
                </span>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Customer Name</p>
                  <p className="font-semibold text-gray-900">{selectedProject.customerName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{selectedProject.customerEmail}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{selectedProject.customerPhone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">{selectedProject.location?.city}</p>
                </div>
              </div>

              {/* System Details */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">System Capacity</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedProject.systemCapacity} kW</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Panel Count</p>
                    <p className="text-2xl font-bold text-green-600">{selectedProject.panelCount}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Inverter</p>
                    <p className="text-sm font-bold text-purple-600">{selectedProject.inverterModel || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Survey Details (if available) */}
              {selectedProject.survey && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Survey Details</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Status: {selectedProject.survey.status}</p>
                    {selectedProject.survey.notes && (
                      <p className="text-sm text-gray-700 mt-2">{selectedProject.survey.notes}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Installation Details (if available) */}
              {selectedProject.installation && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Installation Progress</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Status: {selectedProject.installation.status}</p>
                    {selectedProject.installation.progress !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-blue-600 h-3 rounded-full transition-all" 
                              style={{width: `${selectedProject.installation.progress}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 w-12">{selectedProject.installation.progress}%</span>
                        </div>
                      </div>
                    )}
                    {selectedProject.installation.notes && (
                      <p className="text-sm text-gray-700 mt-2">{selectedProject.installation.notes}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Inventory Allocation</h3>
                  <button
                    onClick={() => openInventoryModal(selectedProject)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    Select Inventory
                  </button>
                </div>
                {Array.isArray(selectedProject.inventorySelection) && selectedProject.inventorySelection.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProject.inventorySelection.map((sel) => (
                      <div key={`${sel.category}-${sel.itemId}`} className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-sm font-semibold text-gray-800">
                          {sel.name || sel.sku || sel.category}
                        </p>
                        <p className="text-xs text-gray-600">
                          {sel.category} • Qty: {sel.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No inventory selected yet.</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Task Status</h3>
              <div className="grid grid-cols-3 gap-4">
                {selectedProject.status === "survey" && (
                  <button
                    onClick={() => openUpdateModal(selectedProject, "survey")}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg font-semibold transition"
                  >
                    ✅ Complete Survey
                  </button>
                )}
                {(selectedProject.status === "installation" ||
                  selectedProject.status === "engineer_assigned" ||
                  selectedProject.status === "on_hold") && (
                  <button
                    onClick={() => openUpdateModal(selectedProject, "installation")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition"
                  >
                    🔧 Update Installation
                  </button>
                )}
                {selectedProject.status === "testing" && (
                  <button
                    onClick={() => openUpdateModal(selectedProject, "testing")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition"
                  >
                    ✅ Complete Testing
                  </button>
                )}
                {selectedProject.status === "go_live" && (
                  <button
                    onClick={() => openGoLiveModal(selectedProject)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition"
                  >
                    🚀 Confirm Go-Live
                  </button>
                )}
              </div>
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

      {/* INVENTORY SELECTION MODAL */}
      {showInventoryModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Select Inventory</h2>
                <p className="text-gray-600 mt-1">Choose items and quantities for installation</p>
              </div>
              <button onClick={() => setShowInventoryModal(false)} className="text-2xl text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>

            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">Auto-fill based on capacity</p>
              <button
                onClick={() => applyAutoFillSelection(selectedProject)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-semibold"
              >
                Auto-fill Qty
              </button>
            </div>

            <div className="space-y-4">
              {[
                { key: "panel", label: "Solar Panels" },
                { key: "inverter", label: "Inverters" },
                { key: "meter", label: "Net Meters" },
                { key: "spare", label: "Spare Parts" },
              ].map((row) => (
                <div key={row.key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{row.label}</label>
                    <select
                      value={inventorySelection[row.key].itemId}
                      onChange={(e) =>
                        setInventorySelection({
                          ...inventorySelection,
                          [row.key]: {
                            ...inventorySelection[row.key],
                            itemId: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                      <option value="">Select item...</option>
                      {inventoryOptions[row.key].map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name} (SKU: {item.sku}) — Available: {item.availableStock}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={inventorySelection[row.key].quantity}
                      onChange={(e) =>
                        setInventorySelection({
                          ...inventorySelection,
                          [row.key]: {
                            ...inventorySelection[row.key],
                            quantity: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setShowInventoryModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInventorySelection}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Save Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE TASK MODAL */}
      {showUpdateModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Update {updateType.charAt(0).toUpperCase() + updateType.slice(1)}
                </h2>
                <p className="text-gray-600 mt-1">{selectedProject.projectName}</p>
              </div>
              <button onClick={() => setShowUpdateModal(false)} className="text-2xl text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>

            <div className="space-y-4">
              {updateType === "survey" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Survey Date</label>
                    <input
                      type="date"
                      value={updateData.surveyDate || ""}
                      onChange={(e) => setUpdateData({...updateData, surveyDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Roof Condition</label>
                    <select
                      value={updateData.roofCondition || ""}
                      onChange={(e) => setUpdateData({...updateData, roofCondition: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                      <option value="">Select condition</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sun Exposure</label>
                    <select
                      value={updateData.sunExposure || ""}
                      onChange={(e) => setUpdateData({...updateData, sunExposure: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                      <option value="">Select exposure</option>
                      <option value="full">Full Sun</option>
                      <option value="partial">Partial Shade</option>
                      <option value="shaded">Mostly Shaded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={updateData.notes || ""}
                      onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      rows="4"
                      placeholder="Survey notes and observations..."
                    />
                  </div>
                </>
              )}

              {updateType === "installation" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={updateData.status || ""}
                      onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date (Optional)</label>
                    <input
                      type="date"
                      value={updateData.startDate || ""}
                      onChange={(e) => setUpdateData({...updateData, startDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Progress (%)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={updateData.progress || 0}
                        onChange={(e) => setUpdateData({...updateData, progress: parseInt(e.target.value)})}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={updateData.progress || 0}
                        onChange={(e) => setUpdateData({...updateData, progress: parseInt(e.target.value)})}
                        className="w-20 border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <span className="text-sm font-semibold text-gray-700">%</span>
                    </div>
                  </div>
                  {updateData.status === "completed" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Completion Date</label>
                      <input
                        type="date"
                        value={updateData.actualCompletionDate || ""}
                        onChange={(e) => setUpdateData({...updateData, actualCompletionDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={updateData.notes || ""}
                      onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      rows="4"
                      placeholder="Installation progress notes..."
                    />
                  </div>
                </>
              )}

              {updateType === "testing" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Test Result</label>
                    <select
                      value={updateData.status || ""}
                      onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    >
                      <option value="in_progress">In Progress</option>
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={updateData.notes || ""}
                      onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      rows="4"
                      placeholder="Testing results and observations..."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleUpdateSubmit}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {submitting ? "Updating..." : "Submit Update"}
              </button>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GO-LIVE CONFIRMATION MODAL */}
      {showGoLiveModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">🚀 Confirm Go-Live</h2>
                <p className="text-gray-600 mt-1">{selectedProject.projectName}</p>
              </div>
              <button onClick={() => setShowGoLiveModal(false)} className="text-2xl text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>

            <div className="space-y-4 bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                <strong>⚠️ Important:</strong> Once confirmed, the project will be marked as LIVE. Please ensure all testing is complete and customer training is done.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Go-Live Date</label>
                <input
                  type="date"
                  value={goLiveData.scheduledDate || ""}
                  onChange={(e) => setGoLiveData({...goLiveData, scheduledDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Meter Reading (kWh)</label>
                <input
                  type="number"
                  placeholder="Enter initial meter reading"
                  value={goLiveData.meterReading || ""}
                  onChange={(e) => setGoLiveData({...goLiveData, meterReading: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Grid Connection Reference</label>
                <input
                  type="text"
                  placeholder="Grid connection reference number"
                  value={goLiveData.gridConnectionRef || ""}
                  onChange={(e) => setGoLiveData({...goLiveData, gridConnectionRef: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Net Metering Status</label>
                <select
                  value={goLiveData.netMeteringStatus || "active"}
                  onChange={(e) => setGoLiveData({...goLiveData, netMeteringStatus: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending Approval</option>
                  <option value="not_applicable">Not Applicable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Training Date</label>
                <input
                  type="date"
                  value={goLiveData.customerTrainingDate || ""}
                  onChange={(e) => setGoLiveData({...goLiveData, customerTrainingDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Training Topics Covered</label>
                <textarea
                  placeholder="E.g., System operation, monitoring, maintenance, troubleshooting..."
                  value={goLiveData.trainingTopics || ""}
                  onChange={(e) => setGoLiveData({...goLiveData, trainingTopics: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  rows="3"
                />
              </div>

              <div className="flex items-center gap-2 bg-yellow-50 p-3 rounded-lg">
                <input
                  type="checkbox"
                  id="docComplete"
                  checked={goLiveData.documentationComplete || false}
                  onChange={(e) => setGoLiveData({...goLiveData, documentationComplete: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="docComplete" className="text-sm font-semibold text-gray-700">
                  ✓ All documentation is complete and verified
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleGoLiveSubmit}
                disabled={submitting || !goLiveData.documentationComplete}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {submitting ? "Confirming..." : "🚀 Confirm Go-Live"}
              </button>
              <button
                onClick={() => setShowGoLiveModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
