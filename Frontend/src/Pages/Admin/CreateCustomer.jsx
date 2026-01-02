import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function CreateCustomer() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    userId: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    systemCapacityKW: "",
  });

  /* 🔹 Fetch users (admin only) */
  useEffect(() => {
    API.get("/admin/users").then((res) => {
      setUsers(res.data);
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/customers", {
        ...form,
        systemCapacityKW: Number(form.systemCapacityKW),
      });

      alert("✅ Customer created successfully");
      navigate("/admin/customers");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-2xl font-bold text-green-700 mb-6">
          ➕ Create Customer (Admin)
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* 🔐 USER SELECT */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Select User (Email)</label>
            <select
              name="userId"
              value={form.userId}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Select User --</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.email}
                </option>
              ))}
            </select>
          </div>

          <Input name="fullName" label="Full Name" onChange={handleChange} required />
          <Input name="phone" label="Phone" onChange={handleChange} required />
          <Input name="address" label="Address" onChange={handleChange} required />
          <Input name="city" label="City" onChange={handleChange} />
          <Input name="state" label="State" onChange={handleChange} />
          <Input name="pincode" label="Pincode" onChange={handleChange} />
          <Input
            name="systemCapacityKW"
            label="System Capacity (kW)"
            type="number"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-green-700 text-white py-2 rounded-lg"
          >
            {loading ? "Creating..." : "Create Customer"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input {...props} className="w-full border rounded px-3 py-2" />
    </div>
  );
}
