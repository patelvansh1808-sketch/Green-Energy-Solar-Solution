import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyCustomer } from "../../services/customerService";
import { useI18n } from "../../Context/I18nContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!user) {
      navigate("/login");
      return;
    }

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
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">

        {/* HEADER */}
        <h2 className="text-2xl font-bold text-green-700 mb-6">
          {t("profile.title")}
        </h2>

        {/* ACCOUNT DETAILS */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t("profile.accountDetails")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Info label={t("profile.email")} value={user?.email} />
            <Info label={t("profile.role")} value={user?.role} />
            <Info
              label={t("profile.connectionType")}
              value={user?.connectionType || t("auth.residential")}
            />
            <div className="p-3 rounded border bg-gray-50">
              <p className="text-gray-500 text-xs mb-1">{t("profile.language")}</p>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border rounded px-2 py-1 bg-white text-gray-800"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="gu">Gujarati</option>
              </select>
            </div>
          </div>
        </section>

        {/* CUSTOMER DETAILS */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t("profile.solarDetails")}
          </h3>

          {customer ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                <Info label={t("profile.customerName")} value={customer.fullName} />
                <Info label={t("profile.phone")} value={customer.phone} />
                <Info label={t("profile.systemCapacity")} value={`${customer.systemCapacityKW} kW`} />
                <Info
                  label={t("profile.installationDate")}
                  value={
                    customer.installationDate
                      ? customer.installationDate.slice(0, 10)
                      : "—"
                  }
                />
                <StatusBadge status={customer.status} label={t("profile.systemStatus")} />
              </div>

              {/* SITE DETAILS */}
              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-700 mb-3">
                  {t("profile.siteLocation")}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <Info label={t("profile.city")} value={customer.city} />
                  <Info label={t("profile.state")} value={customer.state} />
                  <Info label={t("profile.pincode")} value={customer.pincode} />
                </div>
              </div>

              {/* INACTIVE WARNING */}
              {customer.status === "Inactive" && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                  ⚠️ {t("profile.inactiveWarning")}
                </div>
              )}
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
              {t("profile.profileMissing")}
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
            {t("common.logout")}
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

function StatusBadge({ status, label }) {
  const color =
    status === "Active"
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div className={`p-3 rounded border ${color}`}>
      <p className="text-xs mb-1">{label}</p>
      <p className="font-semibold">{status}</p>
    </div>
  );
}
