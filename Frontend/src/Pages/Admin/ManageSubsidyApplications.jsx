import React, { useState, useEffect } from "react";
import subsidyApplicationService from "../../services/subsidyApplicationService";

export default function ManageSubsidyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [updateData, setUpdateData] = useState({
    status: "",
    approvedAmount: "",
    creditDate: "",
    remarks: "",
  });
  const [message, setMessage] = useState("");

  const statuses = ["Applied", "Under Review", "Approved", "Rejected"];
  const statusColors = {
    Applied: "bg-yellow-100 text-yellow-800",
    "Under Review": "bg-blue-100 text-blue-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };

  // Fetch all applications
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await subsidyApplicationService.getAllSubsidyApplications();
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApp = async (app) => {
    let selectedApplication = app;

    try {
      const detailedApplication = await subsidyApplicationService.getSubsidyApplicationById(app._id);
      if (detailedApplication?._id) {
        selectedApplication = detailedApplication;
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
    }

    setSelectedApp(selectedApplication);
    setUpdateData({
      status: selectedApplication.status,
      approvedAmount: selectedApplication.approvedAmount || "",
      creditDate: selectedApplication.creditDate ? selectedApplication.creditDate.split("T")[0] : "",
      remarks: selectedApplication.remarks || "",
    });
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateApplication = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage("");

    try {
      await subsidyApplicationService.updateSubsidyApplication(selectedApp._id, {
        status: updateData.status,
        approvedAmount:
          updateData.status === "Approved" ? parseFloat(updateData.approvedAmount) : 0,
        creditDate: updateData.creditDate || null,
        remarks: updateData.remarks,
      });

      setMessage("✅ Application updated successfully!");
      setTimeout(() => {
        setSelectedApp(null);
        fetchApplications();
      }, 1500);
    } catch (error) {
      setMessage("❌ Failed to update application");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const fileBlob = await subsidyApplicationService.downloadDocument(doc.path);
      const objectUrl = window.URL.createObjectURL(fileBlob);
      const tempLink = document.createElement("a");
      tempLink.href = objectUrl;
      tempLink.download = doc.filename || "document";
      document.body.appendChild(tempLink);
      tempLink.click();
      tempLink.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setMessage("❌ Failed to download document");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  // Search dropdown should show customer-name matches regardless of status filter
  const dropdownApplications = applications.filter((app) =>
    app.customerId?.fullName?.toLowerCase().includes(normalizedSearchTerm)
  );
  const showSearchDropdown = isSearchDropdownOpen && searchTerm.trim().length > 0;
  const selectedDocuments = Array.isArray(selectedApp?.documents)
    ? selectedApp.documents
        .filter(Boolean)
        .map((doc) => {
          if (typeof doc === "string") {
            return {
              filename: doc.split("/").pop() || "Document",
              path: doc,
              uploadedAt: null,
            };
          }

          return {
            filename: doc.filename || doc.originalname || doc.name || "Document",
            path: doc.path || doc.filePath || "",
            uploadedAt: doc.uploadedAt || null,
          };
        })
        .filter((doc) => Boolean(doc.path))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Manage Subsidy Applications</h1>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
            <p className="text-gray-600 text-sm font-medium">Total Applications</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{applications.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-medium">Applied</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {applications.filter((a) => a.status === "Applied").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium">Under Review</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {applications.filter((a) => a.status === "Under Review").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Approved</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {applications.filter((a) => a.status === "Approved").length}
            </p>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">🔍 Search Customer</label>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearchDropdownOpen(true);
                }}
                onFocus={() => {
                  if (searchTerm.trim()) {
                    setIsSearchDropdownOpen(true);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {showSearchDropdown && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                  {dropdownApplications.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">No matching customer found</div>
                  ) : (
                    dropdownApplications.map((app) => (
                      <button
                        key={app._id}
                        type="button"
                        onClick={() => {
                          handleSelectApp(app);
                          setSearchTerm(app.customerId?.fullName || "");
                          setIsSearchDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{app.customerId?.fullName || "N/A"}</p>
                            <p className="text-xs text-gray-500 truncate">{app.customerId?.email || "N/A"}</p>
                          </div>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${statusColors[app.status]}`}>
                            {app.status}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Status</label>
              <div className="flex gap-2 flex-wrap">
                {["All", "Applied", "Under Review", "Approved", "Rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                      filterStatus === status
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {status} ({status === "All" 
                      ? applications.length
                      : applications.filter((a) => a.status === status).length
                    })
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div>
          {/* APPLICATION DETAILS & UPDATE FORM */}
          <div>
            {selectedApp ? (
              <div className="bg-white rounded-lg shadow p-6 space-y-6 max-h-screen overflow-y-auto">
                {message && (
                  <div className={`p-4 rounded-lg ${
                    message.includes("✅")
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {message}
                  </div>
                )}

                {/* CUSTOMER DETAILS */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    👤 Customer Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-semibold text-gray-800">{selectedApp.customerId?.fullName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-semibold text-gray-800 text-xs">{selectedApp.customerId?.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-semibold text-gray-800">{selectedApp.customerId?.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">DISCOM</p>
                      <p className="font-semibold text-gray-800">{selectedApp.customerId?.discom || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* APPLICATION STATUS */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    📊 Application Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className={`p-3 rounded-lg ${statusColors[selectedApp.status]}`}>
                      <p className="text-xs font-semibold opacity-75">Current Status</p>
                      <p className="text-lg font-bold">{selectedApp.status}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Applied Date</p>
                      <p className="font-semibold text-gray-800">{formatDate(selectedApp.appliedDate)}</p>
                    </div>
                  </div>
                </div>

                {/* SUBSIDY AMOUNTS */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    💰 Subsidy Amount
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4\">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Applied Amount</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        ₹{selectedApp.appliedAmount?.toLocaleString("en-IN") || "0"}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">Approved Amount</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        ₹{selectedApp.approvedAmount?.toLocaleString("en-IN") || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* UPDATE FORM */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    ⚙️ Update Application
                  </h3>
                  <form onSubmit={handleUpdateApplication} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <select
                        name="status"
                        value={updateData.status}
                        onChange={handleUpdateChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {updateData.status === "Approved" && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Approved Amount (₹)
                          </label>
                          <input
                            type="number"
                            name="approvedAmount"
                            value={updateData.approvedAmount}
                            onChange={handleUpdateChange}
                            placeholder="Enter approved amount"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Credit Date</label>
                          <input
                            type="date"
                            name="creditDate"
                            value={updateData.creditDate}
                            onChange={handleUpdateChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                      <textarea
                        name="remarks"
                        value={updateData.remarks}
                        onChange={handleUpdateChange}
                        placeholder="Add admin remarks..."
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
                    >
                      {updateLoading ? "⏳ Updating..." : "✅ Update Application"}
                    </button>
                  </form>
                </div>

                {/* BANK DETAILS */}
                {selectedApp.bankDetails && (
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      🏦 Bank Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded\">
                      <div>
                        <p className="text-gray-500">Account Holder</p>
                        <p className="font-semibold text-gray-800">{selectedApp.bankDetails.accountHolder}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Account Number</p>
                        <p className="font-semibold text-gray-800">{selectedApp.bankDetails.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">IFSC Code</p>
                        <p className="font-semibold text-gray-800">{selectedApp.bankDetails.ifscCode}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bank Name</p>
                        <p className="font-semibold text-gray-800">{selectedApp.bankDetails.bankName}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* DOCUMENTS */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    📄 Submitted Documents ({selectedDocuments.length})
                  </h3>
                  {selectedDocuments.length === 0 ? (
                    <div className="p-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500">
                      No documents available for this application.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {selectedDocuments.map((doc, idx) => (
                        <button
                          key={`${doc.path}-${idx}`}
                          type="button"
                          onClick={() => handleDownloadDocument(doc)}
                          className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{doc.filename}</p>
                            <p className="text-xs text-gray-500">
                              {doc.uploadedAt
                                ? new Date(doc.uploadedAt).toLocaleDateString("en-IN")
                                : "Upload date not available"}
                            </p>
                          </div>
                          <span className="ml-2 text-blue-600 font-semibold text-sm">↓</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center h-96 flex items-center justify-center">
                <p className="text-gray-500 text-lg">Search customer and select from dropdown to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
