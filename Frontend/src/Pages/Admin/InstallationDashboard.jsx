import React, { useState, useEffect } from "react";
import api from "../../services/api";

const AdminInstallationDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    leadId: "",
    surveyDate: "",
    surveyNotes: "",
  });

  useEffect(() => {
    fetchProjects();
    fetchEngineers();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/installations");
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching projects:", err);
      console.error("Error details:", err.response?.data);
      console.error("Error status:", err.response?.status);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchEngineers = async () => {
    try {
      const { data } = await api.get("/users");
      const engs = data.filter((u) => u.role === "engineer");
      setEngineers(engs);
    } catch (err) {
      console.error("Error fetching engineers:", err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/installations", formData);
      setProjects([...projects, data]);
      setFormData({ customerId: "", leadId: "", surveyDate: "", surveyNotes: "" });
      setShowCreateForm(false);
      setError(null);
    } catch (err) {
      setError("Failed to create project");
    }
  };

  const handleAssignEngineer = async (projectId, engineerId) => {
    try {
      const { data } = await api.patch(
        `/installations/${projectId}/assign-engineer`,
        { engineerId }
      );
      setProjects(
        projects.map((p) => (p._id === projectId ? data.project : p))
      );
      setSelectedProject(data.project);
    } catch (err) {
      setError("Failed to assign engineer");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      survey_pending: "bg-gray-100 text-gray-800",
      survey_scheduled: "bg-blue-100 text-blue-800",
      engineer_assigned: "bg-indigo-100 text-indigo-800",
      install_in_progress: "bg-yellow-100 text-yellow-800",
      commissioning_done: "bg-green-100 text-green-800",
      live: "bg-green-500 text-white",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredProjects =
    filterStatus === "all"
      ? projects
      : projects.filter((p) => p.status === filterStatus);

  const getProgressStats = () => {
    const total = projects.length;
    const live = projects.filter((p) => p.status === "live").length;
    const inProgress = projects.filter((p) =>
      ["install_in_progress", "engineer_assigned"].includes(p.status)
    ).length;
    const pending = projects.filter((p) =>
      ["survey_pending", "survey_scheduled"].includes(p.status)
    ).length;
    return { total, live, inProgress, pending };
  };

  const stats = getProgressStats();

  if (loading)
    return (
      <div className="text-center text-gray-600 py-8">Loading projects...</div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Installation & Project Dashboard
        </h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
        >
          + New Project
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Projects</p>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Live</p>
          <p className="text-3xl font-bold text-green-600">{stats.live}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-500">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-gray-600">{stats.pending}</p>
        </div>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Create New Project
          </h2>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <input
              type="text"
              placeholder="Customer ID"
              value={formData.customerId}
              onChange={(e) =>
                setFormData({ ...formData, customerId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Lead ID (optional)"
              value={formData.leadId}
              onChange={(e) =>
                setFormData({ ...formData, leadId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="datetime-local"
              placeholder="Survey Date"
              value={formData.surveyDate}
              onChange={(e) =>
                setFormData({ ...formData, surveyDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <textarea
              placeholder="Survey Notes"
              value={formData.surveyNotes}
              onChange={(e) =>
                setFormData({ ...formData, surveyNotes: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows="3"
            ></textarea>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Filter by Status
        </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Projects</option>
          <option value="survey_pending">Survey Pending</option>
          <option value="survey_scheduled">Survey Scheduled</option>
          <option value="engineer_assigned">Engineer Assigned</option>
          <option value="install_in_progress">Installation In Progress</option>
          <option value="commissioning_done">Commissioning Done</option>
          <option value="live">Live</option>
        </select>
      </div>

      {/* Projects Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left font-semibold text-gray-800">
                Customer
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-800">
                Status
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-800">
                Engineer
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-800">
                Progress
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-800">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                  No projects found
                </td>
              </tr>
            ) : (
              filteredProjects.map((proj) => (
                <tr
                  key={proj._id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-gray-800">
                    {proj.customer?.fullName || "Unknown"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(proj.status)}`}>
                      {proj.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {proj.assignedEngineer ? (
                      <span>
                        {proj.assignedEngineer.firstName}{" "}
                        {proj.assignedEngineer.lastName}
                      </span>
                    ) : (
                      <select
                        onChange={(e) =>
                          handleAssignEngineer(proj._id, e.target.value)
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="">Assign...</option>
                        {engineers.map((eng) => (
                          <option key={eng._id} value={eng._id}>
                            {eng.firstName} {eng.lastName}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${proj.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{proj.progress}%</p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedProject(proj)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed View Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedProject.customer?.fullName || "Project Details"}
              </h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-800">
                  {selectedProject.customer?.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Assigned Engineer</p>
                <p className="font-semibold text-gray-800">
                  {selectedProject.assignedEngineer
                    ? `${selectedProject.assignedEngineer.firstName} ${selectedProject.assignedEngineer.lastName}`
                    : "Not assigned"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${selectedProject.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm font-semibold text-gray-800 mt-1">
                  {selectedProject.progress}% Complete
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInstallationDashboard;
