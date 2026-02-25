import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import LocationService from "../../services/locationService";

export default function CreateCustomer() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [discoms, setDiscoms] = useState([]);

  const [form, setForm] = useState({
    userId: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    district: "",
    discom: "",
    pincode: "",
    systemCapacityKW: "",
  });

  /* 🔹 Fetch users (admin only) */
  useEffect(() => {
    API.get("/admin/users").then((res) => {
      setUsers(res.data);
    });
  }, []);

  /* 🔹 Load states on mount */
  useEffect(() => {
    const allStates = LocationService.getStates();
    setStates(allStates);
  }, []);

  /* 🔹 Load districts when state changes */
  useEffect(() => {
    if (form.state) {
      const stateDistricts = LocationService.getDistricts(form.state);
      setDistricts(stateDistricts);
      // Reset district when state changes
      setForm(prev => ({ ...prev, district: "", discom: "" }));
    } else {
      setDistricts([]);
      setDiscoms([]);
    }
  }, [form.state]);

  /* 🔹 Load DISCOMs when state or district changes */
  useEffect(() => {
    if (form.state) {
      const stateDISCOMs = LocationService.getDISCOMs(form.state, form.district);
      setDiscoms(stateDISCOMs);
      // Reset discom when state/district changes
      if (form.district) {
        setForm(prev => ({ ...prev, discom: "" }));
      }
    } else {
      setDiscoms([]);
    }
  }, [form.state, form.district]);

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
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-4 sm:p-8\">
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

          {/* State Dropdown */}
          <div>
            <label className="text-sm text-gray-600">State *</label>
            <select
              name="state"
              value={form.state}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Select State --</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div>
            <label className="text-sm text-gray-600">District *</label>
            <select
              name="district"
              value={form.district}
              onChange={handleChange}
              required
              disabled={!form.state}
              className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
            >
              <option value="">-- Select District --</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* DISCOM Dropdown */}
          <div>
            <label className="text-sm text-gray-600">DISCOM *</label>
            <select
              name="discom"
              value={form.discom}
              onChange={handleChange}
              required
              disabled={!form.state}
              className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
            >
              <option value="">-- Select DISCOM --</option>
              {discoms.map((discom) => (
                <option key={discom} value={discom}>
                  {discom}
                </option>
              ))}
            </select>
          </div>

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
