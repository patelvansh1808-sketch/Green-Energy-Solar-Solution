import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useI18n } from "../../Context/I18nContext";
import LocationService from "../../services/locationService";
import OSMAddressInput from "../../Components/OSMAddressInput";

const CONNECTION_TYPES = ["Residential", "Commercial", "Industrial"];

const validateRegisterField = (name, value, allValues) => {
  const trimmedValue = String(value ?? "").trim();

  switch (name) {
    case "name":
      if (!trimmedValue) return "Full name is required.";
      if (trimmedValue.length < 3) return "Full name must be at least 3 characters.";
      if (!/^[A-Za-z]+(?:[A-Za-z .'-]*[A-Za-z])?$/.test(trimmedValue)) {
        return "Enter a valid full name.";
      }
      return "";
    case "phone":
      if (!trimmedValue) return "Phone number is required.";
      if (!/^[6-9]\d{9}$/.test(trimmedValue)) return "Enter a valid 10-digit mobile number.";
      return "";
    case "email":
      if (!trimmedValue) return "Email address is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) return "Enter a valid email address.";
      return "";
    case "password":
      if (!trimmedValue) return "Password is required.";
      if (trimmedValue.length < 8) return "Password must be at least 8 characters.";
      if (!/[A-Z]/.test(trimmedValue)) return "Password must include at least one uppercase letter.";
      if (!/[a-z]/.test(trimmedValue)) return "Password must include at least one lowercase letter.";
      if (!/\d/.test(trimmedValue)) return "Password must include at least one number.";
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(trimmedValue)) {
        return "Password must include at least one special character.";
      }
      return "";
    case "address":
      if (!trimmedValue) return "Address is required.";
      if (trimmedValue.length < 10) return "Address must be at least 10 characters.";
      return "";
    case "city":
      if (!trimmedValue) return "";
      if (trimmedValue.length < 2) return "City name must be at least 2 characters.";
      if (!/^[A-Za-z]+(?:[A-Za-z .'-]*[A-Za-z])?$/.test(trimmedValue)) return "Enter a valid city name.";
      return "";
    case "state":
      if (!trimmedValue) return "State is required.";
      return "";
    case "district":
      if (!trimmedValue) return "District is required.";
      return "";
    case "discom":
      if (!trimmedValue) return "DISCOM is required.";
      return "";
    case "pincode":
      if (!trimmedValue) return "Pincode is required.";
      if (!/^\d{6}$/.test(trimmedValue)) return "Pincode must be exactly 6 digits.";
      return "";
    case "systemCapacityKW": {
      if (!trimmedValue) return "System capacity is required.";
      const capacity = Number(trimmedValue);
      if (!Number.isFinite(capacity)) return "Enter a valid system capacity.";
      if (capacity <= 0) return "System capacity must be greater than 0.";
      if (capacity > 10000) return "System capacity is too high. Enter a realistic value.";
      return "";
    }
    case "connectionType":
      if (!trimmedValue) return "User type is required.";
      if (!CONNECTION_TYPES.includes(trimmedValue)) return "Select a valid user type.";
      return "";
    default:
      return "";
  }
};

const validateRegisterForm = (values) => {
  const fields = [
    "name",
    "phone",
    "email",
    "password",
    "address",
    "city",
    "state",
    "district",
    "discom",
    "pincode",
    "systemCapacityKW",
    "connectionType",
  ];

  return fields.reduce((accumulator, field) => {
    const error = validateRegisterField(field, values[field], values);
    if (error) {
      accumulator[field] = error;
    }
    return accumulator;
  }, {});
};

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

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

    const nextFormData = {
      ...formData,
      [name]: nextValue,
    };

    setFormData(nextFormData);

    if (touched[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: validateRegisterField(name, nextValue, nextFormData),
      }));
    }

    if (error) {
      setError("");
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateRegisterField(name, value, formData),
    }));
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    const nextFormData = {
      ...formData,
      state: selectedState,
      district: "",
      discom: "",
      location: selectedState,
    };

    setFormData(nextFormData);
    setTouched((prev) => ({
      ...prev,
      state: true,
      district: true,
      discom: true,
    }));
    setFieldErrors((prev) => ({
      ...prev,
      state: validateRegisterField("state", selectedState, nextFormData),
      district: validateRegisterField("district", "", nextFormData),
      discom: validateRegisterField("discom", "", nextFormData),
    }));
    setDistricts(selectedState ? LocationService.getDistricts(selectedState) : []);
    setDiscoms([]);
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    const nextFormData = {
      ...formData,
      district: selectedDistrict,
      discom: "",
    };

    setFormData(nextFormData);
    setTouched((prev) => ({
      ...prev,
      district: true,
      discom: true,
    }));
    setFieldErrors((prev) => ({
      ...prev,
      district: validateRegisterField("district", selectedDistrict, nextFormData),
      discom: validateRegisterField("discom", "", nextFormData),
    }));
    setDiscoms(
      nextFormData.state
        ? LocationService.getDISCOMs(nextFormData.state, selectedDistrict)
        : []
    );
  };

  const getInputClassName = (fieldName) => {
    const hasError = Boolean(fieldErrors[fieldName]);
    return `w-full rounded-lg border px-4 py-2 outline-none transition focus:ring-2 ${
      hasError
        ? "border-red-400 bg-red-50 focus:ring-red-200"
        : "border-gray-300 focus:ring-green-600"
    }`;
  };

  const renderFieldError = (fieldName) => {
    if (!fieldErrors[fieldName]) return null;
    return <p className="mt-1 text-xs text-red-600">{fieldErrors[fieldName]}</p>;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const nextFieldErrors = validateRegisterForm(formData);
    setFieldErrors(nextFieldErrors);
    setTouched({
      name: true,
      phone: true,
      email: true,
      password: true,
      address: true,
      city: true,
      state: true,
      district: true,
      discom: true,
      pincode: true,
      systemCapacityKW: true,
      connectionType: true,
    });

    if (Object.keys(nextFieldErrors).length > 0) {
      setError("Please correct the highlighted fields before submitting.");
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
          <div>
            <input
              type="text"
              name="name"
              placeholder={t("auth.fullName")}
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={getInputClassName("name")}
            />
            {renderFieldError("name")}
          </div>

          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength="10"
              required
              className={getInputClassName("phone")}
            />
            {renderFieldError("phone")}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder={t("auth.email")}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={getInputClassName("email")}
            />
            {renderFieldError("email")}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder={t("auth.password")}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={getInputClassName("password")}
            />
            {renderFieldError("password")}
          </div>

          <div>
            <OSMAddressInput
              value={formData.address}
              onChange={(nextAddress) => {
                const nextFormData = {
                  ...formData,
                  address: nextAddress,
                };
                setFormData(nextFormData);
                if (touched.address) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    address: validateRegisterField("address", nextAddress, nextFormData),
                  }));
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, address: true }));
                setFieldErrors((prev) => ({
                  ...prev,
                  address: validateRegisterField("address", formData.address, formData),
                }));
              }}
              placeholder="Address"
              required
              className={getInputClassName("address")}
            />
            {renderFieldError("address")}
          </div>

          <div>
            <input
              type="text"
              name="city"
              placeholder="City (optional)"
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClassName("city")}
            />
            {renderFieldError("city")}
          </div>

          <div>
            <select
              name="state"
              value={formData.state}
              onChange={handleStateChange}
              onBlur={handleBlur}
              required
              className={getInputClassName("state")}
            >
              <option value="">-- Select State --</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {renderFieldError("state")}
          </div>

          <div>
            <select
              name="district"
              value={formData.district}
              onChange={handleDistrictChange}
              onBlur={handleBlur}
              required
              disabled={!formData.state}
              className={`${getInputClassName("district")} disabled:bg-gray-100`}
            >
              <option value="">-- Select District --</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {renderFieldError("district")}
          </div>

          <div>
            <select
              name="discom"
              value={formData.discom}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={!formData.state}
              className={`${getInputClassName("discom")} disabled:bg-gray-100`}
            >
              <option value="">-- Select DISCOM --</option>
              {discoms.map((discom) => (
                <option key={discom} value={discom}>
                  {discom}
                </option>
              ))}
            </select>
            {renderFieldError("discom")}
          </div>

          <div>
            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength="6"
              required
              className={getInputClassName("pincode")}
            />
            {renderFieldError("pincode")}
          </div>

          <div>
            <input
              type="number"
              name="systemCapacityKW"
              placeholder="System Capacity (kW)"
              min="0"
              step="0.1"
              value={formData.systemCapacityKW}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={getInputClassName("systemCapacityKW")}
            />
            {renderFieldError("systemCapacityKW")}
          </div>

          <div>
            <select
              name="connectionType"
              value={formData.connectionType}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={getInputClassName("connectionType")}
            >
              <option value="">{t("auth.userType")}</option>
              <option value="Residential">{t("auth.residential")}</option>
              <option value="Commercial">{t("auth.commercial")}</option>
              <option value="Industrial">{t("auth.industrial", "Industrial")}</option>
            </select>
            {renderFieldError("connectionType")}
          </div>

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
