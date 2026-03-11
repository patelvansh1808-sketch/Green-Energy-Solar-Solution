import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useI18n } from "../../Context/I18nContext";
import LocationService from "../../services/locationService";
import OSMAddressInput from "../../Components/OSMAddressInput";

export default function Register() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [discoms, setDiscoms] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    district: "",
    discom: "",
    pincode: "",
    systemCapacityKW: "",
    connectionType: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStates(LocationService.getStates());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    // Keep phone and pincode numeric at input level.
    if (name === "phone" || name === "pincode") {
      nextValue = value.replace(/\D/g, "");
    }

    setFormData({
      ...formData,
      [name]: nextValue,
    });

    if (error) {
      setError("");
    }
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setFormData((prev) => ({
      ...prev,
      state: selectedState,
      district: "",
      discom: "",
      location: selectedState,
    }));
    setDistricts(selectedState ? LocationService.getDistricts(selectedState) : []);
    setDiscoms([]);
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setFormData((prev) => ({
      ...prev,
      district: selectedDistrict,
      discom: "",
    }));
    setDiscoms(
      formData.state
        ? LocationService.getDISCOMs(formData.state, selectedDistrict)
        : []
    );
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "name",
      "email",
      "password",
      "phone",
      "address",
      "state",
      "district",
      "discom",
      "pincode",
      "systemCapacityKW",
      "connectionType",
    ];

    const missingFields = requiredFields.filter(
      (field) => !String(formData[field] || "").trim()
    );

    if (missingFields.length > 0) {
      setError("Please fill all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      setError("Pincode must be exactly 6 digits.");
      return;
    }

    if (Number(formData.systemCapacityKW) <= 0) {
      setError("System capacity must be greater than 0.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        ...formData,
        systemCapacityKW: Number(formData.systemCapacityKW),
      });

      alert("Registration successful. Please login to continue.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4 sm:p-6">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-4xl p-6 sm:p-8 animate-slideUp">
        <h2 className="text-2xl font-bold text-green-700 text-center mb-6">
          {t("auth.registerTitle")}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 md:col-span-2">
            {error}
          </div>
        )}

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submitHandler}>
          <input
            type="text"
            name="name"
            placeholder={t("auth.fullName")}
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            maxLength="10"
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder={t("auth.email")}
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder={t("auth.password")}
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          />

          <OSMAddressInput
            value={formData.address}
            onChange={(nextAddress) =>
              setFormData((prev) => ({
                ...prev,
                address: nextAddress,
              }))
            }
            placeholder="Address"
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          />

          <input
            type="text"
            name="city"
            placeholder="City (optional)"
            value={formData.city}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          />

          <select
            name="state"
            value={formData.state}
            onChange={handleStateChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          >
            <option value="">-- Select State --</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <select
            name="district"
            value={formData.district}
            onChange={handleDistrictChange}
            required
            disabled={!formData.state}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none disabled:bg-gray-100"
          >
            <option value="">-- Select District --</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>

          <select
            name="discom"
            value={formData.discom}
            onChange={handleChange}
            required
            disabled={!formData.state}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none disabled:bg-gray-100"
          >
            <option value="">-- Select DISCOM --</option>
            {discoms.map((discom) => (
              <option key={discom} value={discom}>
                {discom}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handleChange}
            maxLength="6"
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          />

          <input
            type="number"
            name="systemCapacityKW"
            placeholder="System Capacity (kW)"
            min="0"
            step="0.1"
            value={formData.systemCapacityKW}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          />

          <select
            name="connectionType"
            value={formData.connectionType}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 outline-none"
          >
            <option value="">{t("auth.userType")}</option>
            <option value="Residential">{t("auth.residential")}</option>
            <option value="Commercial">{t("auth.commercial")}</option>
            <option value="Industrial">{t("auth.industrial", "Industrial")}</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg font-semibold transition"
          >
            {loading ? t("auth.registering") : t("common.register")}
          </button>
        </form>

        <p className="text-sm text-center mt-6">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="text-green-700 font-semibold">
            {t("common.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
