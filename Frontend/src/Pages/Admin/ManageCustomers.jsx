import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCustomers } from "../../services/customerService";

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  const loadCustomers = async () => {
    try {
      const res = await getAllCustomers();
      setCustomers(res.data);
    } catch (error) {
      console.error("Failed to load customers", error);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-700">
          Manage Customers
        </h2>

        {/* ✅ ONLY REDIRECT BUTTON */}
        <button
          onClick={() => navigate("/admin/create-customer")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
        >
          ➕ Create Customer
        </button>
      </div>

      {/* CUSTOMER TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-center">Phone</th>
              <th className="p-3 text-center">Capacity</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{c.fullName}</td>
                  <td className="p-3 text-center">{c.phone}</td>
                  <td className="p-3 text-center">
                    {c.systemCapacityKW} kW
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-3 py-1 rounded text-sm font-semibold ${
                        c.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.status}
                    </span>
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
