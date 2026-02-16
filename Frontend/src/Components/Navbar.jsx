import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, hasCustomerProfile } = useAuth();
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

  return (
    <nav className="bg-green-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-2xl">☀️</span>
          <span className="text-lg md:text-xl font-bold">SuryaUrja</span>
        </Link>

        {/* ===== DESKTOP MENU ===== */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">

          <Link to="/" className="hover:text-green-200 transition">
            Home
          </Link>

          {user && !isAuthRoute && (
            <>
              {hasCustomerProfile && (
                <Link to="/dashboard" className="hover:text-green-200 transition">
                  Dashboard
                </Link>
              )}

              {/* FEATURES */}
              <div className="relative group">
                <button className="hover:text-green-200 transition">
                  Features ▾
                </button>
                <div className="absolute left-0 top-full pt-2 hidden group-hover:block bg-white text-gray-700 rounded-lg shadow-lg w-56 z-50 py-2">
                  <NavItem to="/booking" label="📅 Booking" />
                  <NavItem to="/booking-status" label="📊 Booking Status" />
                  <NavItem to="/apply-subsidy" label="💰 Apply for Subsidy" />
                  <NavItem to="/subsidy-status" label="📈 Subsidy Status" />
                </div>
              </div>

              {/* CRM */}
              {user.role === "admin" && (
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
              {user.role === "engineer" && (
                <Link to="/engineer/dashboard" className="hover:text-green-200 transition">
                  🔧 My Tasks
                </Link>
              )}

              {/* TEAM MEMBER DASHBOARD */}
              {(user.role === "engineer" || user.role === "sales" || user.role === "support") && (
                <Link to="/team/my-leads" className="hover:text-green-200 transition">
                  📋 My Leads
                </Link>
              )}

              {/* NOTIFICATIONS BELL */}
              <NotificationBell />

              {/* PROFILE */}
              <div className="relative group">
                <button className="hover:text-green-200 transition">
                  Profile ▾
                </button>

                <div className="absolute right-0 top-full pt-2 hidden group-hover:block bg-white text-gray-700 rounded-lg shadow-lg w-56 z-50 py-2">
                  <NavItem to="/profile" label="👤 My Profile" />

                  {/* 🔐 ADMIN LINKS */}
                  {user.role === "admin" && (
                    <>
                      <div className="border-t my-1"></div>

                      <NavItem
                        to="/admin/customers"
                        label="🧑‍💼 Manage Customers"
                        admin
                      />

                      <NavItem
                    to="/admin/subsidy-applications"
                    label="📋 Subsidy Applications"
                    admin
                  />

                  <NavItem
                    to="/admin/roles"
                    label="👥 Role Management"
                    admin
                  />

                  <NavItem
                    to="/admin/projects"
                    label="🔧 Installation Tracking"
                    admin
                  />

                  <NavItem
                    to="/admin/finance"
                    label="💼 Financial Analytics"
                    admin
                  />

                  <NavItem
                    to="/admin/inventory"
                    label="📦 Inventory Management"
                    admin
                  />

                  <NavItem
                    to="/admin"
                    label="⚙️ Admin Dashboard"
                    admin
                  />
                </>
              )}

              {(user.role === "admin" || user.role === "support") && (
                <NavItem
                  to="/admin/tickets"
                  label="🎫 Ticket Management"
                  admin
                />
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </>
      )}

      {user && !isAuthRoute && (
        <Link to="/support" className="hover:text-green-200 transition">
          Support
        </Link>
      )}

      <Link to="/contact" className="hover:text-green-200 transition">
        Contact
      </Link>

          {!user && (
            <>
              <Link to="/login" className="hover:text-green-200 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-green-700 px-4 py-2 rounded-lg font-bold"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          ☰
        </button>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {open && (
        <div className="md:hidden bg-green-600 px-4 py-4 space-y-2 text-sm">
          <Link to="/" onClick={() => setOpen(false)}>Home</Link>

          {user && !isAuthRoute && (
            <>
              {hasCustomerProfile && (
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
              )}

              <p className="text-xs uppercase text-green-200 mt-3">⚡ Features</p>
              <MobileItem to="/booking" label="📅 Booking" />
              <MobileItem to="/booking-status" label="📊 Booking Status" />
              <MobileItem to="/apply-subsidy" label="💰 Apply for Subsidy" />
              <MobileItem to="/subsidy-status" label="📈 Subsidy Status" />

              {user.role === "admin" && (
                <>
                  <p className="text-xs uppercase text-green-200 mt-3">📱 CRM</p>
                  <MobileItem to="/crm/dashboard" label="📊 CRM Dashboard" />
                  <MobileItem to="/crm/sales-dashboard" label="💼 Sales Dashboard" />
                </>
              )}

              <p className="text-xs uppercase text-green-200 mt-3">👤 Account</p>
              <MobileItem to="/profile" label="My Profile" />

              {user.role === "admin" && (
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

              <button
                onClick={handleLogout}
                className="block w-full text-left text-red-200 mt-2"
              >
                🚪 Logout
              </button>
            </>
          )}

          {!user && (
            <>
              <Link to="/contact" onClick={() => setOpen(false)}>Contact</Link>
              <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
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
  <Link to={to} className="block py-1">
    {label}
  </Link>
);
