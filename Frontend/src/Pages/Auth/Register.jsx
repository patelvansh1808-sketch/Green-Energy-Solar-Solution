import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../Context/AuthContext";
import { useI18n } from "../../Context/I18nContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useI18n();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    connectionType: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/register", formData);

      // ✅ Pass both token and user data
      login(res.data.token, res.data.user);

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 animate-slideUp">
        <h2 className="text-2xl font-bold text-green-700 text-center mb-6">
          {t("auth.registerTitle")}
        </h2>

        <form className="space-y-4" onSubmit={submitHandler}>
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

          <input
            type="text"
            name="location"
            placeholder={t("auth.location")}
            value={formData.location}
            onChange={handleChange}
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
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg font-semibold transition"
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
