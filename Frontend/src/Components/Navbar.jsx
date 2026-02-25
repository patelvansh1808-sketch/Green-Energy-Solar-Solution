import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import NotificationBell from "./NotificationBell";
import { useI18n } from "../Context/I18nContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, hasCustomerProfile } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setOpen(false);

  const showSupportLink = user && !isAuthRoute;
  const showDashboardLink = user && !isAuthRoute && hasCustomerProfile;
  const isAdmin = user?.role === "admin";
  const isTeamMember = user?.role === "engineer" || user?.role === "sales" || user?.role === "support";

  return (
    <nav className="bg-green-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center gap-3">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition min-w-0">
          <span className="text-xl sm:text-2xl">☀️</span>
          <span className="text-base sm:text-lg md:text-xl font-bold truncate">{t("common.appName")}</span>
        </Link>

        {/* ===== DESKTOP MENU ===== */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium">

          <Link to="/" className="hover:text-green-200 transition">
            {t("nav.home")}
          </Link>

          {showDashboardLink && (
            <Link to="/dashboard" className="hover:text-green-200 transition">
              {t("nav.dashboard")}
            </Link>
          )}

          {user && !isAuthRoute && (
            <>
              {/* FEATURES */}
              <div className="relative group">
                <button className="hover:text-green-200 transition">
                  {t("nav.features")} ▾
                </button>
                <div className="absolute left-0 top-full pt-2 hidden group-hover:block bg-white text-gray-700 rounded-lg shadow-lg w-56 z-50 py-2">
                  <NavItem to="/booking" label={`📅 ${t("nav.booking")}`} />
                  <NavItem to="/booking-status" label={`📊 ${t("nav.bookingStatus")}`} />
                  <NavItem to="/maintenance" label={`🛠️ ${t("nav.maintenance")}`} />
                  <NavItem to="/apply-subsidy" label={`💰 ${t("nav.applySubsidy")}`} />
                  <NavItem to="/subsidy-status" label={`📈 ${t("nav.subsidyStatus")}`} />
                </div>
              </div>

              {/* CRM */}
              {isAdmin && (
                <div className="relative group">
                  <button className="hover:text-green-200 transition">
                    CRM ▾
                  </button>
                  <div className="absolute left-0 top-full pt-2 hidden group-hover:block bg-white text-gray-700 rounded-lg shadow-lg w-56 z-50 py-2">
                    <NavItem to="/crm/dashboard" label="📊 CRM Dashboard" highlight />
                    <NavItem to="/crm/sales-dashboard" label="💼 Sales Dashboard" />
                  </div>
                </div>
              )}

              {/* ENGINEER DASHBOARD */}
              {user?.role === "engineer" && (
                <Link to="/engineer/dashboard" className="hover:text-green-200 transition">
                  🔧 {t("nav.myTasks")}
                </Link>
              )}

              {/* TEAM MEMBER DASHBOARD */}
              {isTeamMember && (
                <Link to="/team/my-leads" className="hover:text-green-200 transition">
                  📋 {t("nav.myLeads")}
                </Link>
              )}

              {/* NOTIFICATIONS BELL */}
              <NotificationBell />

              {/* PROFILE */}
              <div className="relative group">
                <button className="hover:text-green-200 transition">
                  {t("nav.profile")} ▾
                </button>

                <div className="absolute right-0 top-full pt-2 hidden group-hover:block bg-white text-gray-700 rounded-lg shadow-lg w-56 z-50 py-2">
                  <NavItem to="/profile" label={`👤 ${t("nav.myProfile")}`} />

                  {/* 🔐 ADMIN LINKS */}
                  {isAdmin && (
                    <>
                      <div className="border-t my-1"></div>

                      <NavItem
                        to="/admin/customers"
                        label="🧑‍💼 Manage Customers"
                        admin
                      />

                      <NavItem to="/admin/subsidy-applications" label="📋 Subsidy Applications" admin />
                      <NavItem to="/admin/roles" label="👥 Role Management" admin />
                      <NavItem to="/admin/projects" label="🔧 Installation Tracking" admin />
                      <NavItem to="/admin/finance" label="💼 Financial Analytics" admin />
                      <NavItem to="/admin/inventory" label="📦 Inventory Management" admin />
                      <NavItem to="/admin" label="⚙️ Admin Dashboard" admin />
                    </>
                  )}

                  {(isAdmin || user?.role === "support") && (
                    <NavItem to="/admin/tickets" label="🎫 Ticket Management" admin />
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                  >
                    🚪 {t("common.logout")}
                  </button>
                </div>
              </div>
            </>
          )}

          {showSupportLink && (
            <Link to="/support" className="hover:text-green-200 transition">
              {t("common.support")}
            </Link>
          )}

          <Link to="/contact" className="hover:text-green-200 transition">
            {t("common.contact")}
          </Link>

          {!user && (
            <>
              <Link to="/login" className="hover:text-green-200 transition">
                {t("common.login")}
              </Link>
              <Link
                to="/register"
                className="bg-white text-green-700 px-4 py-2 rounded-lg font-bold"
              >
                {t("common.register")}
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="lg:hidden inline-flex items-center justify-center rounded-md border border-green-500/70 bg-green-600 px-3 py-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {open && (
        <div className="lg:hidden bg-green-600 px-4 py-4 space-y-2 text-sm max-h-[75vh] overflow-y-auto">
          <Link to="/" onClick={closeMenu} className="block py-1">{t("nav.home")}</Link>

          {user && !isAuthRoute && (
            <>
              {showDashboardLink && (
                <Link to="/dashboard" onClick={closeMenu} className="block py-1">
                  {t("nav.dashboard")}
                </Link>
              )}

              <p className="text-xs uppercase text-green-200 mt-3">⚡ {t("nav.features")}</p>
              <MobileItem to="/booking" label={`📅 ${t("nav.booking")}`} />
              <MobileItem to="/booking-status" label={`📊 ${t("nav.bookingStatus")}`} />
              <MobileItem to="/maintenance" label={`🛠️ ${t("nav.maintenance")}`} />
              <MobileItem to="/apply-subsidy" label={`💰 ${t("nav.applySubsidy")}`} />
              <MobileItem to="/subsidy-status" label={`📈 ${t("nav.subsidyStatus")}`} />

              {isAdmin && (
                <>
                  <p className="text-xs uppercase text-green-200 mt-3">📱 CRM</p>
                  <MobileItem to="/crm/dashboard" label="📊 CRM Dashboard" />
                  <MobileItem to="/crm/sales-dashboard" label="💼 Sales Dashboard" />
                </>
              )}

              <p className="text-xs uppercase text-green-200 mt-3">👤 {t("nav.profile")}</p>
              <MobileItem to="/profile" label={t("nav.myProfile")} />

              {isAdmin && (
                <>
                  <MobileItem to="/admin/customers" label="🧑‍💼 Manage Customers" />
                  <MobileItem to="/admin/subsidy-applications" label="📋 Subsidy Applications" />
                  <MobileItem to="/admin/roles" label="👥 Role Management" />
                  <MobileItem to="/admin/projects" label="🔧 Installation Tracking" />
                  <MobileItem to="/admin/finance" label="💼 Financial Analytics" />
                  <MobileItem to="/admin/inventory" label="📦 Inventory Management" />
                  <MobileItem to="/admin" label="⚙️ Admin Dashboard" />
                </>
              )}

              {(isAdmin || user?.role === "support") && (
                <MobileItem to="/admin/tickets" label="🎫 Ticket Management" />
              )}

              <MobileItem to="/support" label={t("common.support")} />
              <MobileItem to="/contact" label={t("common.contact")} />

              <button
                onClick={handleLogout}
                className="block w-full text-left text-red-200 mt-2"
              >
                🚪 {t("common.logout")}
              </button>
            </>
          )}

          {!user && (
            <>
              <Link to="/contact" onClick={closeMenu} className="block py-1">{t("common.contact")}</Link>
              <Link to="/login" onClick={closeMenu} className="block py-1">{t("common.login")}</Link>
              <Link to="/register" onClick={closeMenu} className="block py-1">{t("common.register")}</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

/* Reusable Components */
const NavItem = ({ to, label, highlight, admin }) => (
  <Link
    to={to}
    className={`block px-4 py-2 hover:bg-green-50 ${
      highlight ? "font-semibold text-green-700" : ""
    } ${admin ? "text-yellow-600 font-semibold" : ""}`}
  >
    {label}
  </Link>
);

const MobileItem = ({ to, label }) => (
  <Link to={to} className="block py-1.5">
    {label}
  </Link>
);
