import React, { useState, useEffect } from "react";
import api from "../../services/api";

const InstallationTracking = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state for updates
  const [progressPercent, setProgressPercent] = useState("");
  const [progressNote, setProgressNote] = useState("");
  const [commissionNotes, setCommissionNotes] = useState("");

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

  const handleUpdateProgress = async (projectId) => {
    if (!progressPercent) {
      setError("Please enter a progress percentage");
      return;
    }
    try {
      const { data } = await api.patch(
        `/installations/${projectId}/progress`,
        { percent: parseInt(progressPercent), note: progressNote }
      );
      setProjects(projects.map((p) => (p._id === projectId ? data : p)));
      setSelectedProject(data);
      setProgressPercent("");
      setProgressNote("");
    } catch (err) {
      setError("Failed to update progress");
    }
  };

  const handleMarkCommissioned = async (projectId) => {
    try {
      const { data } = await api.patch(
        `/installations/${projectId}/commission`,
        { notes: commissionNotes }
      );
      setProjects(projects.map((p) => (p._id === projectId ? data : p)));
      setSelectedProject(data);
      setCommissionNotes("");
    } catch (err) {
      setError("Failed to mark as commissioned");
    }
  };

  const handleMarkLive = async (projectId) => {
    try {
      const { data } = await api.patch(
        `/installations/${projectId}/live`,
        {}
      );
      setProjects(projects.map((p) => (p._id === projectId ? data : p)));
      setSelectedProject(data);
    } catch (err) {
      setError("Failed to mark as live");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      survey_pending: "bg-gray-200 text-gray-800",
      survey_scheduled: "bg-blue-200 text-blue-800",
      engineer_assigned: "bg-indigo-200 text-indigo-800",
      install_in_progress: "bg-yellow-200 text-yellow-800",
      commissioning_done: "bg-green-100 text-green-800",
      live: "bg-green-500 text-white",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) return <div className="text-center text-gray-600 py-8">Loading projects...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Installation & Project Tracking
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Projects</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {projects.length === 0 ? (
              <p className="text-gray-500">No projects yet</p>
            ) : (
              projects.map((proj) => (
                <button
                  key={proj._id}
                  onClick={() => setSelectedProject(proj)}
                  className={`w-full p-3 text-left rounded-lg border-2 transition ${
                    selectedProject?._id === proj._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-800">
                    {proj.customer?.fullName || "Unknown Customer"}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded inline-block mt-1 ${getStatusColor(proj.status)}`}>
                    {proj.status.replace(/_/g, " ")}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Project Details */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedProject.customer?.fullName || "Project Details"}
                </h2>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.status.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>

                {/* Site Survey */}
                <div className="bg-white p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                  <h3 className="font-semibold text-gray-800 mb-2">📍 Site Survey</h3>
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-semibold">{selectedProject.siteSurvey?.status || "Pending"}</span>
                  </p>
                  {selectedProject.siteSurvey?.scheduledDate && (
                    <p className="text-sm text-gray-600">
                      Scheduled: {new Date(selectedProject.siteSurvey.scheduledDate).toLocaleDateString()}
                    </p>
                  )}
                  {selectedProject.siteSurvey?.notes && (
                    <p className="text-sm text-gray-600 mt-1">Notes: {selectedProject.siteSurvey.notes}</p>
                  )}
                </div>

                {/* Engineer Assignment */}
                <div className="bg-white p-4 rounded-lg mb-4 border-l-4 border-indigo-500">
                  <h3 className="font-semibold text-gray-800 mb-2">👷 Assigned Engineer</h3>
                  {selectedProject.assignedEngineer ? (
                    <p className="text-sm text-gray-600">
                      {selectedProject.assignedEngineer.firstName} {selectedProject.assignedEngineer.lastName}
                    </p>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        onChange={(e) =>
                          handleAssignEngineer(selectedProject._id, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">Select Engineer</option>
                        {engineers.map((eng) => (
                          <option key={eng._id} value={eng._id}>
                            {eng.firstName} {eng.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Installation Progress */}
                <div className="bg-white p-4 rounded-lg mb-4 border-l-4 border-yellow-500">
                  <h3 className="font-semibold text-gray-800 mb-2">🔨 Installation Progress</h3>
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${selectedProject.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{selectedProject.progress}% Complete</p>
                  </div>
                  {selectedProject.assignedEngineer && (
                    <div className="space-y-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Progress %"
                        value={progressPercent}
                        onChange={(e) => setProgressPercent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <textarea
                        placeholder="Progress note (optional)"
                        value={progressNote}
                        onChange={(e) => setProgressNote(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows="2"
                      ></textarea>
                      <button
                        onClick={() => handleUpdateProgress(selectedProject._id)}
                        className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600"
                      >
                        Update Progress
                      </button>
                    </div>
                  )}
                </div>

                {/* Commissioning */}
                {selectedProject.progress >= 90 && selectedProject.status !== "live" && (
                  <div className="bg-white p-4 rounded-lg mb-4 border-l-4 border-green-500">
                    <h3 className="font-semibold text-gray-800 mb-2">✅ Testing & Commissioning</h3>
                    <textarea
                      placeholder="Commissioning notes (optional)"
                      value={commissionNotes}
                      onChange={(e) => setCommissionNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                      rows="2"
                    ></textarea>
                    <button
                      onClick={() => handleMarkCommissioned(selectedProject._id)}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600"
                    >
                      Mark Commissioned
                    </button>
                  </div>
                )}

                {/* Go Live */}
                {selectedProject.status === "commissioning_done" && (
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-700">
                    <h3 className="font-semibold text-gray-800 mb-2">🚀 Go Live</h3>
                    <p className="text-sm text-gray-600 mb-3">System ready for production use</p>
                    <button
                      onClick={() => handleMarkLive(selectedProject._id)}
                      className="w-full px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800"
                    >
                      Confirm Go Live
                    </button>
                  </div>
                )}

                {/* Progress Logs */}
                {selectedProject.progressLogs && selectedProject.progressLogs.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3">📋 Progress History</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedProject.progressLogs.map((log, idx) => (
                        <div key={idx} className="text-sm bg-white p-2 rounded border-l-2 border-blue-300">
                          <p className="font-semibold text-gray-800">{log.percent}%</p>
                          {log.note && <p className="text-gray-600 text-xs">{log.note}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Select a project to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallationTracking;
