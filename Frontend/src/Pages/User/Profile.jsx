import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyCustomer } from "../../services/customerService";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyCustomer()
      .then((res) => {
        setCustomer(res.data);
        setError("");
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setCustomer(null);
        } else {
          setError("Failed to load customer profile");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">

        {/* HEADER */}
        <h2 className="text-2xl font-bold text-green-700 mb-6">
          Customer Profile
        </h2>

        {/* ACCOUNT DETAILS */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Account Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Info label="Email" value={user?.email} />
            <Info label="Role" value={user?.role} />
            <Info
              label="Connection Type"
              value={user?.connectionType || "Residential"}
            />
          </div>
        </section>

        {/* CUSTOMER DETAILS */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Solar System Details
          </h3>

          {customer ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Info label="Customer Name" value={customer.fullName} />
              <Info label="Phone" value={customer.phone} />
              <Info label="Address" value={customer.address} />
              <Info
                label="System Capacity"
                value={`${customer.systemCapacityKW} kW`}
              />
              <Info
                label="Installation Date"
                value={
                  customer.installationDate
                    ? customer.installationDate.slice(0, 10)
                    : "—"
                }
              />
              <StatusBadge status={customer.status} />
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
              Customer profile not created yet.
              <br />
              Please contact support to complete installation details.
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded">
              {error}
            </div>
          )}
        </section>

        {/* ACTIONS */}
        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================== COMPONENTS ================== */

function Info({ label, value }) {
  return (
    <div className="p-3 rounded border bg-gray-50">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="font-semibold text-gray-800">{value || "—"}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const color =
    status === "Active"
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div className={`p-3 rounded border ${color}`}>
      <p className="text-xs mb-1">System Status</p>
      <p className="font-semibold">{status}</p>
    </div>
  );
}
