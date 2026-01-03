import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    systemCapacityKW: "",
    installationDate: "",
  });

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const res = await API.get(`/customers/${id}`);
        const customer = res.data;
        
        setForm({
          fullName: customer.fullName || "",
          phone: customer.phone || "",
          address: customer.address || "",
          city: customer.city || "",
          state: customer.state || "",
          pincode: customer.pincode || "",
          systemCapacityKW: customer.systemCapacityKW || "",
          installationDate: customer.installationDate 
            ? new Date(customer.installationDate).toISOString().split('T')[0]
            : "",
        });
      } catch (error) {
        console.error("Failed to load customer:", error);
        alert("Failed to load customer details");
        navigate("/admin/customers");
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim() || !form.systemCapacityKW) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      await API.patch(`/customers/${id}`, {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        systemCapacityKW: parseFloat(form.systemCapacityKW),
        installationDate: form.installationDate || null,
      });

      alert("Customer updated successfully");
      navigate("/admin/customers");
    } catch (error) {
      console.error("Failed to update customer:", error);
      alert(error.response?.data?.message || "Failed to update customer");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6 text-green-700">
        Edit Customer
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name *</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Phone *</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Address *</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Address"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="State"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Pincode</label>
            <input
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              placeholder="Pincode"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">System Capacity (kW) *</label>
            <input
              name="systemCapacityKW"
              type="number"
              step="0.1"
              value={form.systemCapacityKW}
              onChange={handleChange}
              placeholder="System Capacity"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Installation Date</label>
            <input
              name="installationDate"
              type="date"
              value={form.installationDate}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-green-700 text-white py-2 rounded hover:bg-green-800 disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/customers")}
            className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
