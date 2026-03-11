import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import LocationService from "../../services/locationService";
import OSMAddressInput from "../../Components/OSMAddressInput";

export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [discoms, setDiscoms] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    district: "",
    discom: "",
    pincode: "",
    systemCapacityKW: "",
    installationDate: "",
  });

  /* 🔹 Load states on mount */
  useEffect(() => {
    const allStates = LocationService.getStates();
    setStates(allStates);
  }, []);

  /* 🔹 Load districts and DISCOMs when state changes */
  useEffect(() => {
    if (form.state) {
      const stateDistricts = LocationService.getDistricts(form.state);
      setDistricts(stateDistricts);
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
    } else {
      setDiscoms([]);
    }
  }, [form.state, form.district]);

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
          district: customer.district || "",
          discom: customer.discom || "",
          pincode: customer.pincode || "",
          systemCapacityKW: customer.systemCapacityKW || "",
          installationDate: customer.installationDate 
            ? new Date(customer.installationDate).toISOString().split('T')[0]
            : "",
        });
      } catch (error) {
        console.error("Failed to load customer:", error);
        navigate("/admin/customers");
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id, navigate]);

  const handleChange = (e) => {
    if (formError) setFormError("");
    const { name, value } = e.target;

    if (name === "district") {
      setForm({
        ...form,
        district: value,
      });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim() || !form.systemCapacityKW) {
      setFormError("Please fill in all required fields");
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
        district: form.district.trim(),
        discom: form.discom.trim(),
        pincode: form.pincode.trim(),
        systemCapacityKW: parseFloat(form.systemCapacityKW),
        installationDate: form.installationDate || null,
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to update customer:", error);
      setFormError(error.response?.data?.message || "Failed to update customer");
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

      {formError && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </div>
      )}

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
            <OSMAddressInput
              value={form.address}
              onChange={(nextAddress) =>
                setForm((prev) => ({
                  ...prev,
                  address: nextAddress,
                }))
              }
              placeholder="Address"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">State *</label>
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

          <div>
            <label className="block text-sm font-semibold mb-2">District *</label>
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

          <div>
            <label className="block text-sm font-semibold mb-2">DISCOM *</label>
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

          <div>
            <label className="block text-sm font-semibold mb-2">Pincode</label>
            <input
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              placeholder="Pincode"
              maxLength="6"
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

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Success</h3>
            <p className="text-gray-700 mb-6">Customer updated successfully</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/admin/customers");
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
