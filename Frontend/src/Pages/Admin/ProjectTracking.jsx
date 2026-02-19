import { useState, useEffect, useCallback } from "react";
import projectService from "../../services/projectService";
import roleService from "../../services/roleService";
import inventoryService from "../../services/inventoryService";

export default function ProjectTracking() {
  const [projects, setProjects] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showEngineerModal, setShowEngineerModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingFilters, setBookingFilters] = useState({
    startDate: "",
    endDate: "",
    searchTerm: ""
  });

  // Form states
  const [createForm, setCreateForm] = useState({
    projectName: "",
    description: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    location: { address: "", city: "", state: "", postalCode: "" },
    systemCapacity: "",
    panelCount: "",
    inverterModel: "",
    batteryCapacity: "",
    budget: { totalCost: "", advancePayment: "" },
    priority: "normal",
  });

  const [surveyForm, setSurveyForm] = useState({
    surveyDate: "",
    roofCondition: "",
    sunExposure: "",
    obstructions: "",
    estimatedROI: "",
    estimatedMonthlyGeneration: "",
    notes: "",
  });

  const [engineerForm, setEngineerForm] = useState({
    engineerId: "",
  });

  const [showInventoryModal, setShowInventoryModal] = useState(false);
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

  const fetchProjects = useCallback(async () => {
    try {
      const filters = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        search: searchTerm || undefined,
      };

      const data = await projectService.getAllProjects(filters);
      setProjects(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load projects");
    }
  }, [statusFilter, priorityFilter, searchTerm]);

  const fetchStatistics = async () => {
    try {
      const data = await projectService.getProjectStats();
      setStatistics(data);
    } catch (err) {
      console.error("Failed to load statistics:", err);
    }
  };

  const fetchEngineers = async () => {
    try {
      const data = await roleService.getAllUsers({ role: "staff" });
      const assignees = Array.isArray(data)
        ? data.filter((user) => user.role === "engineer" || user.role === "technician")
        : [];
      setEngineers(assignees);
    } catch (err) {
      console.error("Failed to load engineers:", err);
    }
  };

  const fetchAvailableBookings = async (filters = {}) => {
    try {
      setBookingLoading(true);
      const data = await projectService.getAvailableBookings(filters);
      setBookings(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setBookingLoading(false);
    }
  };
  
  const handleBookingFilterChange = (field, value) => {
    const newFilters = { ...bookingFilters, [field]: value };
    setBookingFilters(newFilters);
    fetchAvailableBookings(newFilters);
  };
  
  const setQuickDateFilter = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const filters = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      searchTerm: ""
    };
    setBookingFilters(filters);
    fetchAvailableBookings(filters);
  };
  
  const clearBookingFilters = () => {
    const emptyFilters = { startDate: "", endDate: "", searchTerm: "" };
    setBookingFilters(emptyFilters);
    fetchAvailableBookings();
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
        { selections }
      );
      setSelectedProject(updated);
      setShowInventoryModal(false);
      setSuccess("Inventory selection saved");
      setTimeout(() => setSuccess(""), 3000);
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save inventory selection");
    }
  };

  const handleSelectBooking = async (booking) => {
    try {
      const details = await projectService.getBookingDetails(booking._id);
      setSelectedBooking(details);
    } catch (err) {
      setError("Failed to load booking details");
    }
  };

  const handleCreateFromBooking = async () => {
    if (!selectedBooking) return;
    try {
      setError("");
      const data = {
        projectName: `${selectedBooking.customerName} - ${selectedBooking.systemCapacity}kW Solar`,
        priority: "normal",
      };
      await projectService.createProjectFromBooking(selectedBooking._id, data);
      setSuccess("Project created successfully from booking!");
      setShowBookingModal(false);
      setSelectedBooking(null);
      setBookings([]);
      await fetchProjects();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProjects(), fetchStatistics(), fetchEngineers()]);
      setLoading(false);
    };
    loadData();
  }, [fetchProjects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await projectService.createProject(createForm);
      setSuccess("Project created successfully!");
      setShowCreateModal(false);
      setCreateForm({
        projectName: "",
        description: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        location: { address: "", city: "", state: "", postalCode: "" },
        systemCapacity: "",
        panelCount: "",
        inverterModel: "",
        batteryCapacity: "",
        budget: { totalCost: "", advancePayment: "" },
        priority: "normal",
      });
      await fetchProjects();
      await fetchStatistics();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  };

  const handleUpdateSurvey = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      await projectService.updateSiteSurvey(selectedProject._id, surveyForm);
      setSuccess("Survey updated successfully!");
      setShowSurveyModal(false);
      await fetchProjects();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update survey");
    }
  };

  const handleAssignEngineer = async (e) => {
    e.preventDefault();
    if (!selectedProject || !engineerForm.engineerId) return;

    try {
      await projectService.assignEngineer(selectedProject._id, { engineerId: engineerForm.engineerId });
      setSuccess("Engineer assigned successfully!");
      setShowEngineerModal(false);
      await fetchProjects();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign engineer");
    }
  };

  const openDetailModal = (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const openSurveyModal = (project) => {
    setSelectedProject(project);
    setSurveyForm({
      surveyDate: project.survey?.surveyDate?.split("T")[0] || "",
      roofCondition: project.survey?.roofCondition || "",
      sunExposure: project.survey?.sunExposure || "",
      obstructions: project.survey?.obstructions || "",
      estimatedROI: project.survey?.estimatedROI || "",
      estimatedMonthlyGeneration: project.survey?.estimatedMonthlyGeneration || "",
      notes: project.survey?.notes || "",
    });
    setShowSurveyModal(true);
  };

  const openEngineerModal = (project) => {
    setSelectedProject(project);
    setEngineerForm({
      engineerId: project.engineerAssignment?.engineerId || "",
    });
    setShowEngineerModal(true);
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      survey: "bg-yellow-100 text-yellow-800",
      engineer_assigned: "bg-blue-100 text-blue-800",
      installation: "bg-purple-100 text-purple-800",
      testing: "bg-orange-100 text-orange-800",
      go_live: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      on_hold: "bg-red-100 text-red-800",
      cancelled: "bg-red-200 text-red-900",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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

  const getPriorityColor = (priority) => {
    const colors = {
      low: "text-green-600",
      normal: "text-blue-600",
      high: "text-orange-600",
      urgent: "text-red-600",
    };
    return colors[priority] || "text-gray-600";
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading projects...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Installation & Project Tracking</h1>
            <p className="text-gray-600 mt-2">Manage projects from survey to go-live</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowBookingModal(true);
                fetchAvailableBookings();
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              📋 From Booking
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              + New Project
            </button>
          </div>
        </div>

        {success && <div className="bg-green-50 border border-green-300 text-green-800 rounded-lg p-4 mb-6">{success}</div>}
        {error && <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg p-4 mb-6">{error}</div>}

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-800">{statistics.total}</div>
              <div className="text-sm text-gray-600">Total Projects</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-700">
                {statistics.byStatus?.find((s) => s._id === "completed")?.count || 0}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-purple-700">
                {statistics.byStatus?.find((s) => s._id === "installation")?.count || 0}
              </div>
              <div className="text-sm text-gray-600">In Installation</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-red-700">
                {statistics.byStatus?.find((s) => s._id === "survey")?.count || 0}
              </div>
              <div className="text-sm text-gray-600">Pending Survey</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by project name or customer"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="survey">Site Survey</option>
                <option value="engineer_assigned">Engineer Assigned</option>
                <option value="installation">Installation</option>
                <option value="testing">Testing & Commissioning</option>
                <option value="go_live">Go-Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Project</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Engineer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Capacity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project._id} className="hover:bg-gray-50 border-b border-gray-200">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{project.projectName}</p>
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
                          {project.engineerAssignment?.engineerName ? (
                            <p className="font-medium text-gray-900">{project.engineerAssignment.engineerName}</p>
                          ) : (
                            <p className="text-gray-500 italic">Not assigned</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{project.systemCapacity} kW</p>
                          <p className="text-gray-600">{project.panelCount} panels</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${getPriorityColor(project.priority)}`}>
                          {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openDetailModal(project)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm font-semibold transition"
                          >
                            View
                          </button>
                          {project.status === "survey" && (
                            <button
                              onClick={() => openSurveyModal(project)}
                              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1 rounded text-sm font-semibold transition"
                            >
                              Survey
                            </button>
                          )}
                          {project.status === "engineer_assigned" && !project.engineerAssignment?.engineerId && (
                            <button
                              onClick={() => openEngineerModal(project)}
                              className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded text-sm font-semibold transition"
                            >
                              Assign
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name*</label>
                  <input
                    type="text"
                    required
                    value={createForm.projectName}
                    onChange={(e) => setCreateForm({ ...createForm, projectName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name*</label>
                  <input
                    type="text"
                    required
                    value={createForm.customerName}
                    onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Email*</label>
                  <input
                    type="email"
                    required
                    value={createForm.customerEmail}
                    onChange={(e) => setCreateForm({ ...createForm, customerEmail: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Phone*</label>
                  <input
                    type="tel"
                    required
                    value={createForm.customerPhone}
                    onChange={(e) => setCreateForm({ ...createForm, customerPhone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">System Capacity (kW)*</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={createForm.systemCapacity}
                    onChange={(e) => setCreateForm({ ...createForm, systemCapacity: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Panel Count</label>
                  <input
                    type="number"
                    value={createForm.panelCount}
                    onChange={(e) => setCreateForm({ ...createForm, panelCount: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Location Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Address"
                    value={createForm.location.address}
                    onChange={(e) => setCreateForm({ ...createForm, location: { ...createForm.location, address: e.target.value } })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={createForm.location.city}
                    onChange={(e) => setCreateForm({ ...createForm, location: { ...createForm.location, city: e.target.value } })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={createForm.location.state}
                    onChange={(e) => setCreateForm({ ...createForm, location: { ...createForm.location, state: e.target.value } })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={createForm.location.postalCode}
                    onChange={(e) => setCreateForm({ ...createForm, location: { ...createForm.location, postalCode: e.target.value } })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Budget</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-700 mb-1">Total Cost</label>
                    <input
                      type="number"
                      value={createForm.budget.totalCost}
                      onChange={(e) => setCreateForm({ ...createForm, budget: { ...createForm.budget, totalCost: e.target.value } })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1">Advance Payment</label>
                    <input
                      type="number"
                      value={createForm.budget.advancePayment}
                      onChange={(e) => setCreateForm({ ...createForm, budget: { ...createForm.budget, advancePayment: e.target.value } })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SITE SURVEY MODAL */}
      {showSurveyModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Site Survey</h2>
            <form onSubmit={handleUpdateSurvey} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Survey Date*</label>
                  <input
                    type="date"
                    required
                    value={surveyForm.surveyDate}
                    onChange={(e) => setSurveyForm({ ...surveyForm, surveyDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Roof Condition</label>
                  <input
                    type="text"
                    placeholder="e.g., Excellent, Good, Fair"
                    value={surveyForm.roofCondition}
                    onChange={(e) => setSurveyForm({ ...surveyForm, roofCondition: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sun Exposure</label>
                  <input
                    type="text"
                    placeholder="e.g., North-facing, South-facing"
                    value={surveyForm.sunExposure}
                    onChange={(e) => setSurveyForm({ ...surveyForm, sunExposure: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated ROI (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={surveyForm.estimatedROI}
                    onChange={(e) => setSurveyForm({ ...surveyForm, estimatedROI: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Obstructions</label>
                <textarea
                  placeholder="Describe any obstructions..."
                  value={surveyForm.obstructions}
                  onChange={(e) => setSurveyForm({ ...surveyForm, obstructions: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Survey Notes</label>
                <textarea
                  placeholder="Additional notes..."
                  value={surveyForm.notes}
                  onChange={(e) => setSurveyForm({ ...surveyForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Complete Survey
                </button>
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN ENGINEER MODAL */}
      {showEngineerModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Assign Engineer</h2>
            <form onSubmit={handleAssignEngineer} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Engineer*</label>
                <select
                  required
                  value={engineerForm.engineerId}
                  onChange={(e) => setEngineerForm({ engineerId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Choose an engineer...</option>
                  {engineers.map((eng) => (
                    <option key={eng._id} value={eng._id}>
                      {eng.firstName} {eng.lastName} - {eng.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Assign Engineer
                </button>
                <button
                  type="button"
                  onClick={() => setShowEngineerModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              {/* Status Timeline */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline & Status</h3>
                <div className="space-y-4">
                  {/* Current Status */}
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(selectedProject.status)}`}>
                        {getStatusLabel(selectedProject.status)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">Current Stage</span>
                  </div>

                  {/* Survey Status */}
                  {selectedProject.survey && (
                    <div className={`p-3 rounded-lg ${selectedProject.survey.status === 'completed' ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${selectedProject.survey.status === 'completed' ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                          <span className="font-semibold text-gray-900">🔍 Site Survey</span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          selectedProject.survey.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {selectedProject.survey.status}
                        </span>
                      </div>
                      {selectedProject.survey.status === 'completed' && selectedProject.survey.surveyDate && (
                        <p className="text-sm text-gray-600 mt-2 ml-6">
                          Completed: {new Date(selectedProject.survey.surveyDate).toLocaleDateString()}
                          {selectedProject.survey.surveyorName && ` by ${selectedProject.survey.surveyorName}`}
                        </p>
                      )}
                      {selectedProject.survey.notes && (
                        <p className="text-sm text-gray-700 mt-2 ml-6 italic">"{selectedProject.survey.notes}"</p>
                      )}
                    </div>
                  )}

                  {/* Engineer Assignment */}
                  {selectedProject.engineerAssignment?.engineerId && (
                    <div className={`p-3 rounded-lg ${selectedProject.engineerAssignment.status === 'assigned' ? 'bg-purple-50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${selectedProject.engineerAssignment.status === 'assigned' ? 'bg-purple-600' : 'bg-gray-400'}`}></div>
                          <span className="font-semibold text-gray-900">👨‍💼 Engineer Assigned</span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          selectedProject.engineerAssignment.status === 'assigned' ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-800'
                        }`}>
                          {selectedProject.engineerAssignment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 ml-6">
                        {selectedProject.engineerAssignment.engineerName}
                        {selectedProject.engineerAssignment.assignedDate && 
                          ` - Assigned on ${new Date(selectedProject.engineerAssignment.assignedDate).toLocaleDateString()}`
                        }
                      </p>
                    </div>
                  )}

                  {/* Installation Status */}
                  {selectedProject.installation && selectedProject.installation.status !== 'not_started' && selectedProject.status === 'installation' && (
                    <div className={`p-3 rounded-lg ${selectedProject.installation.status === 'completed' ? 'bg-green-50' : 'bg-blue-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${selectedProject.installation.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'}`}></div>
                          <span className="font-semibold text-gray-900">🔧 Installation</span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          selectedProject.installation.status === 'completed' ? 'bg-green-200 text-green-800' : 
                          selectedProject.installation.status === 'in_progress' ? 'bg-blue-200 text-blue-800' : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {selectedProject.installation.status}
                        </span>
                      </div>
                      <div className="mt-2 ml-6">
                        {selectedProject.installation.progress !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all" 
                                style={{width: `${selectedProject.installation.progress}%`}}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{selectedProject.installation.progress}%</span>
                          </div>
                        )}
                        {selectedProject.installation.actualCompletionDate && (
                          <p className="text-sm text-gray-600 mt-1">
                            Completed: {new Date(selectedProject.installation.actualCompletionDate).toLocaleDateString()}
                          </p>
                        )}
                        {selectedProject.installation.notes && (
                          <p className="text-sm text-gray-700 mt-2 italic">"{selectedProject.installation.notes}"</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Testing Status */}
                  {selectedProject.testing && selectedProject.testing.status !== 'not_started' && (
                    <div className={`p-3 rounded-lg ${selectedProject.testing.status === 'passed' ? 'bg-green-50' : 'bg-orange-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${selectedProject.testing.status === 'passed' ? 'bg-green-600' : 'bg-orange-600'}`}></div>
                          <span className="font-semibold text-gray-900">✅ Testing & Commissioning</span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          selectedProject.testing.status === 'passed' ? 'bg-green-200 text-green-800' : 
                          selectedProject.testing.status === 'failed' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'
                        }`}>
                          {selectedProject.testing.status}
                        </span>
                      </div>
                      {selectedProject.testing.notes && (
                        <p className="text-sm text-gray-700 mt-2 ml-6 italic">"{selectedProject.testing.notes}"</p>
                      )}
                    </div>
                  )}

                  {/* Go Live Status */}
                  {selectedProject.goLive && selectedProject.goLive.status !== 'not_started' && (
                    <div className="p-3 rounded-lg bg-green-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-600"></div>
                          <span className="font-semibold text-gray-900">🚀 Go-Live</span>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-green-200 text-green-800">
                          {selectedProject.goLive.status}
                        </span>
                      </div>
                      {selectedProject.goLive.actualGoLiveDate && (
                        <p className="text-sm text-gray-600 mt-2 ml-6">
                          Live since: {new Date(selectedProject.goLive.actualGoLiveDate).toLocaleDateString()}
                        </p>
                      )}
                      {selectedProject.goLive.meterReading && (
                        <p className="text-sm text-gray-600 mt-1 ml-6">
                          Initial Meter Reading: {selectedProject.goLive.meterReading} kWh
                        </p>
                      )}
                      {selectedProject.goLive.gridConnectionRef && (
                        <p className="text-sm text-gray-600 mt-1 ml-6">
                          Grid Connection: {selectedProject.goLive.gridConnectionRef}
                        </p>
                      )}
                    </div>
                  )}
                </div>
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

              {/* Engineer Assignment */}
              {selectedProject.engineerAssignment?.engineerName && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Assigned Engineer</h3>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">{selectedProject.engineerAssignment.engineerName}</p>
                    <p className="text-sm text-gray-600">{selectedProject.engineerAssignment.engineerEmail}</p>
                    <p className="text-sm text-gray-600 mt-1">Assigned: {new Date(selectedProject.engineerAssignment.assignedDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {/* Budget */}
              {selectedProject.budget?.totalCost && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Budget</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Cost</p>
                      <p className="text-2xl font-bold text-yellow-600">₹{selectedProject.budget.totalCost?.toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Advance Payment</p>
                      <p className="text-2xl font-bold text-orange-600">₹{selectedProject.budget.advancePayment?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory Allocation */}
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
            <div className="flex gap-3 mt-6">
              {selectedProject.status === "survey" && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openSurveyModal(selectedProject);
                  }}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  📋 Complete Survey
                </button>
              )}
              {!selectedProject.engineerAssignment?.engineerId && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openEngineerModal(selectedProject);
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  👨‍💼 Assign Engineer
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
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

      {/* CREATE FROM BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">📋 Create Project from Booking</h2>
                <p className="text-gray-600 mt-1">Select a booking to auto-populate project details</p>
              </div>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedBooking(null);
                  setBookings([]);
                  clearBookingFilters();
                }}
                className="text-2xl text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Quick Date Filters */}
            {!selectedBooking && (
              <div className="mb-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => setQuickDateFilter(1)}
                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-semibold transition"
                >
                  Today
                </button>
                <button
                  onClick={() => setQuickDateFilter(7)}
                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-semibold transition"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setQuickDateFilter(30)}
                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-semibold transition"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={clearBookingFilters}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-semibold transition"
                >
                  All Bookings
                </button>
              </div>
            )}

            {/* Date Range Filter */}
            {!selectedBooking && (
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
                  <input
                    type="date"
                    value={bookingFilters.startDate}
                    onChange={(e) => handleBookingFilterChange('startDate', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
                  <input
                    type="date"
                    value={bookingFilters.endDate}
                    onChange={(e) => handleBookingFilterChange('endDate', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            {selectedBooking ? (
              <div className="space-y-6">
                {/* Booking Details */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Booking Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Customer Name</p>
                      <p className="font-semibold text-gray-900">{selectedBooking.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{selectedBooking.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">{selectedBooking.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">System Capacity</p>
                      <p className="font-semibold text-gray-900">{selectedBooking.systemCapacity} kW</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">{selectedBooking.location?.address || selectedBooking.location?.city}</p>
                    </div>
                  </div>
                </div>

                {/* Confirmation Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">✅ These details will be automatically populated in your new project</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Choose Different Booking
                  </button>
                  <button
                    onClick={handleCreateFromBooking}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition"
                  >
                    ✓ Create Project
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading available bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No available bookings found</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {bookings
                      .filter(booking => {
                        if (!bookingFilters.searchTerm) return true;
                        const searchLower = bookingFilters.searchTerm.toLowerCase();
                        return (
                          booking.customerName?.toLowerCase().includes(searchLower) ||
                          booking.customerEmail?.toLowerCase().includes(searchLower)
                        );
                      })
                      .map((booking) => (
                      <div
                        key={booking._id}
                        onClick={() => handleSelectBooking(booking)}
                        className="border border-gray-300 rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{booking.customerName}</p>
                            <p className="text-sm text-gray-600">{booking.customerEmail}</p>
                            <p className="text-sm text-gray-600 mt-1">📍 {booking.location?.city || booking.location?.address}</p>
                            <p className="text-xs text-gray-500 mt-1">📅 {new Date(booking.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">{booking.systemCapacity} kW</p>
                            <p className="text-xs text-gray-500">System Capacity</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookings([]);
                  }}
                  className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
