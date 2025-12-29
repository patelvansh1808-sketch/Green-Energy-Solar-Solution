import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

          <Link to="/" className="hover:text-green-200 transition flex items-center gap-1">
            🏠 Home
          </Link>

          {user && (
            <>
              <Link to="/dashboard" className="hover:text-green-200 transition flex items-center gap-1">
                📊 Dashboard
              </Link>

              {/* FEATURES DROPDOWN */}
              <div className="relative group">
                <button className="hover:text-green-200 transition flex items-center gap-1">
                  ⚡ Features <span className="text-xs">▾</span>
                </button>

                <div
                  className="
                    absolute left-0 top-full pt-2
                    hidden group-hover:block hover:block
                    bg-white text-gray-700 rounded-lg shadow-lg w-56 z-50 py-2
                  "
                >
                  <Link to="/prediction" className="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-green-50">
                    🤖 <span>Prediction</span>
                  </Link>
                  <Link to="/analytics" className="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-green-50">
                    📈 <span>Analytics</span>
                  </Link>
                  <Link to="/booking" className="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-green-50">
                    📅 <span>Booking</span>
                  </Link>
                  <Link to="/subsidy" className="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-green-50">
                    💰 <span>Subsidy</span>
                  </Link>
                  <Link to="/cost-roi" className="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-green-50 font-semibold text-green-700">
                    💹 <span>Cost & ROI</span>
                  </Link>
                </div>
              </div>

              {/* REPORTS DROPDOWN */}
              <div className="relative group">
                <button className="hover:text-green-200 transition flex items-center gap-1">
                  📄 Reports <span className="text-xs">▾</span>
                </button>

                <div
                  className="
                    absolute left-0 top-full pt-2
                    hidden group-hover:block hover:block
                    bg-white text-gray-700 rounded-lg shadow-lg w-56 z-50 py-2
                  "
                >
                  <Link to="/alerts" className="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-green-50">
                    🔔 <span>Alerts</span>
                  </Link>
                  <Link to="/notifications" className="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-green-50">
                    📨 <span>Notifications</span>
                  </Link>
                  <Link to="/reports" className="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-green-50">
                    📋 <span>Reports</span>
                  </Link>
                </div>
              </div>

              {/* PROFILE DROPDOWN */}
              <div className="relative group">
                <button className="hover:text-green-200 transition flex items-center gap-1">
                  👤 Profile <span className="text-xs">▾</span>
                </button>

                <div
                  className="
                    absolute right-0 top-full pt-2
                    hidden group-hover:block hover:block
                    bg-white text-gray-700 rounded-lg shadow-lg w-56 z-50 py-2
                  "
                >
                  <Link to="/profile" className="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-green-50">
                    👤 <span>My Profile</span>
                  </Link>

                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      className="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-yellow-50 text-yellow-600 font-semibold"
                    >
                      ⚙️ <span>Admin Panel</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left"
                  >
                    🚪 <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <Link to="/contact" className="hover:text-green-200 transition flex items-center gap-1">
            📞 Contact
          </Link>

          {!user && (
            <>
              <Link to="/login" className="hover:text-green-200 transition flex items-center gap-1">
                🔑 Login
              </Link>
              <Link to="/register" className="bg-white text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg font-bold transition flex items-center gap-1">
                📝 Register
              </Link>
            </>
          )}
        </div>

        {/* ===== MOBILE HAMBURGER ===== */}
        <button
          className="md:hidden p-2 hover:bg-green-600 rounded transition"
          onClick={() => setOpen(!open)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {open && (
        <div className="md:hidden bg-green-600 px-4 py-4 space-y-2 text-sm">
          <Link to="/" onClick={() => setOpen(false)} className="block py-2 px-2 hover:bg-green-500 rounded">
            🏠 Home
          </Link>

          {user && (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block py-2 px-2 hover:bg-green-500 rounded">
                📊 Dashboard
              </Link>

              <div className="border-t border-green-500 pt-2 mt-2">
                <p className="text-green-200 text-xs font-bold uppercase mb-2">⚡ Features</p>
                <Link to="/prediction" onClick={() => setOpen(false)} className="block py-2 px-2 hover:bg-green-500 rounded">
                  🤖 Prediction
                </Link>
                <Link to="/analytics" onClick={() => setOpen(false)} className="block py-2 px-2 hover:bg-green-500 rounded">
                  📈 Analytics
                </Link>
                <Link to="/booking" onClick={() => setOpen(false)} className="block py-2 px-2 hover:bg-green-500 rounded">
                  📅 Booking
                </Link>
                <Link to="/subsidy" onClick={() => setOpen(false)} className="block py-2 px-2 hover:bg-green-500 rounded">
                  💰 Subsidy
                </Link>
                <Link
                  to="/cost-roi"
                  onClick={() => setOpen(false)}
                  className="block py-2 px-2 hover:bg-green-500 rounded font-semibold text-green-200"
                >
                  💹 Cost & ROI
                </Link>
              </div>

              <div className="border-t border-green-500 pt-2 mt-2">
                <p className="text-green-200 text-xs font-bold uppercase mb-2">📄 Reports</p>
                <Link to="/alerts" onClick={() => setOpen(false)} className="block py-2 px-2 hover:bg-green-500 rounded">
                  🔔 Alerts
                </Link>
                <Link to="/notifications" onClick={() => setOpen(false)} className="block py-2 px-2 hover:bg-green-500 rounded">
                  📨 Notifications
                </Link>
                <Link to="/reports" onClick={() => setOpen(false)} className="block py-2 px-2 hover:bg-green-500 rounded">
                  📋 Reports
                </Link>
              </div>

              <div className="border-t border-green-500 pt-2 mt-2">
                <p className="text-green-200 text-xs font-bold uppercase mb-2">👤 Account</p>
                <Link to="/profile" onClick={() => setOpen(false)} className="block py-2 px-2 hover:bg-green-500 rounded">
                  👤 My Profile
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="block py-2 px-2 hover:bg-yellow-500 rounded text-yellow-200 font-semibold"
                  >
                    ⚙️ Admin Panel
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 px-2 hover:bg-red-500 rounded text-red-200 font-bold"
                >
                  🚪 Logout
                </button>
              </div>
            </>
          )}

          <Link to="/contact" onClick={() => setOpen(false)} className="block py-2 px-2 hover:bg-green-500 rounded">
            📞 Contact
          </Link>

          {!user && (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block py-2 px-2 hover:bg-green-500 rounded">
                🔑 Login
              </Link>
              <div className="pt-2">
                <Link to="/register" onClick={() => setOpen(false)} className="block py-2 px-2 bg-white text-green-700 rounded font-bold text-center hover:bg-green-50">
                  📝 Register
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
