import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get status from URL query parameter
  const statusParam = searchParams.get("status");

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching customers from /api/customers...");
      const res = await api.get("/customers");
      console.log("Customers response:", res.data);
      setCustomers(res.data || []);
      setError("");
      
      // Set filter based on URL parameter
      if (statusParam) {
        setFilterStatus(statusParam);
      }
    } catch (error) {
      console.error("Failed to load customers:", error);
      setError(error.response?.data?.message || "Failed to load customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [statusParam]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await api.patch(`/customers/${id}/status`, { status: newStatus });
      loadCustomers();
    } catch (error) {
      alert("Failed to update status: " + error.response?.data?.message);
    }
  };

  const filteredCustomers =
    filterStatus === "All"
      ? customers
      : customers.filter((c) => c.status === filterStatus);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">Error: {error}</p>
          <button
            onClick={loadCustomers}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-700">
          Manage Customers ({filteredCustomers.length})
        </h2>

        {/* Redirect to Create Customer page */}
        <button
          onClick={() => navigate("/admin/create-customer")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
        >
          ➕ Create Customer
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-2 mb-6">
        {["All", "Active", "Inactive"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded font-medium transition ${
              filterStatus === status
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status} ({status === "All" ? customers.length : customers.filter((c) => c.status === status).length})
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-center">Phone</th>
              <th className="p-3 text-center">Capacity</th>
              <th className="p-3 text-center">Installation</th>
              <th className="p-3 text-center">Site</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  {customers.length === 0
                    ? "No customers found in database"
                    : `No ${filterStatus} customers found`}
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-semibold">{c.fullName}</td>

                  <td className="p-3 text-center">{c.phone || "—"}</td>

                  <td className="p-3 text-center">
                    {c.systemCapacityKW} kW
                  </td>

                  <td className="p-3 text-center">
                    {c.installationDate
                      ? new Date(c.installationDate).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="p-3 text-center">
                    {c.city || "—"}, {c.state || "—"}
                    <br />
                    <span className="text-xs text-gray-500">
                      {c.pincode || ""}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        c.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : c.status === "Inactive"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.status || "Active"}
                    </span>
                  </td>

                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/customers/edit/${c._id}`)
                      }
                      className="text-blue-600 hover:underline text-xs font-semibold"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => toggleStatus(c._id, c.status)}
                      className={`text-xs font-semibold ${
                        c.status === "Active"
                          ? "text-red-600 hover:text-red-800"
                          : "text-green-600 hover:text-green-800"
                      }`}
                    >
                      {c.status === "Active"
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
