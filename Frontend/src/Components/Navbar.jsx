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
    <nav className="bg-green-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.png" alt="SuryaUrja" className="h-8 w-8" />
          <span className="text-lg md:text-xl font-bold">SuryaUrja</span>
        </Link>

        {/* ===== DESKTOP MENU ===== */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">

          <Link to="/" className="hover:text-green-200">Home</Link>

          {user && (
            <>
              <Link to="/dashboard" className="hover:text-green-200">
                Dashboard
              </Link>

              {/* FEATURES DROPDOWN */}
              <div className="relative group">
                <button className="hover:text-green-200">
                  Features ▾
                </button>

                <div
                  className="
                    absolute left-0 top-full pt-2
                    hidden group-hover:block hover:block
                    bg-white text-gray-700 rounded shadow-lg w-48 z-50
                  "
                >
                  <Link to="/prediction" className="dropdown-item">
                    Prediction
                  </Link>
                  <Link to="/analytics" className="dropdown-item">
                    Analytics
                  </Link>
                  <Link to="/booking" className="dropdown-item">
                    Booking
                  </Link>
                  <Link to="/subsidy" className="dropdown-item">
                    Subsidy
                  </Link>
                  <Link to="/cost-roi" className="dropdown-item font-semibold text-green-700">
                    Cost & ROI
                  </Link>
                </div>
              </div>

              {/* REPORTS DROPDOWN */}
              <div className="relative group">
                <button className="hover:text-green-200">
                  Reports ▾
                </button>

                <div
                  className="
                    absolute left-0 top-full pt-2
                    hidden group-hover:block hover:block
                    bg-white text-gray-700 rounded shadow-lg w-48 z-50
                  "
                >
                  <Link to="/alerts" className="dropdown-item">
                    Alerts
                  </Link>
                  <Link to="/notifications" className="dropdown-item">
                    Notifications
                  </Link>
                  <Link to="/reports" className="dropdown-item">
                    Reports
                  </Link>
                </div>
              </div>

              {/* PROFILE DROPDOWN */}
              <div className="relative group">
                <button className="hover:text-green-200">
                  Profile ▾
                </button>

                <div
                  className="
                    absolute right-0 top-full pt-2
                    hidden group-hover:block hover:block
                    bg-white text-gray-700 rounded shadow-lg w-48 z-50
                  "
                >
                  <Link to="/profile" className="dropdown-item">
                    My Profile
                  </Link>

                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      className="dropdown-item text-yellow-600 font-semibold"
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="dropdown-item text-red-600 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}

          <Link to="/contact" className="hover:text-green-200">
            Contact
          </Link>

          {!user && (
            <>
              <Link to="/login" className="hover:text-green-200">
                Login
              </Link>
              <Link to="/register" className="hover:text-green-200">
                Register
              </Link>
            </>
          )}
        </div>

        {/* ===== MOBILE HAMBURGER ===== */}
        <button
          className="md:hidden"
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
        <div className="md:hidden bg-green-600 px-4 py-4 space-y-3 text-sm">
          <Link to="/" onClick={() => setOpen(false)} className="block">
            Home
          </Link>

          {user && (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block">
                Dashboard
              </Link>

              <div className="border-t border-green-500 pt-2">
                <p className="text-green-200 text-xs uppercase">Features</p>
                <Link to="/prediction" onClick={() => setOpen(false)} className="block">
                  Prediction
                </Link>
                <Link to="/analytics" onClick={() => setOpen(false)} className="block">
                  Analytics
                </Link>
                <Link to="/booking" onClick={() => setOpen(false)} className="block">
                  Booking
                </Link>
                <Link to="/subsidy" onClick={() => setOpen(false)} className="block">
                  Subsidy
                </Link>
                <Link
                  to="/cost-roi"
                  onClick={() => setOpen(false)}
                  className="block font-semibold text-green-200"
                >
                  Cost & ROI
                </Link>
              </div>

              <div className="border-t border-green-500 pt-2">
                <p className="text-green-200 text-xs uppercase">Reports</p>
                <Link to="/alerts" onClick={() => setOpen(false)} className="block">
                  Alerts
                </Link>
                <Link to="/notifications" onClick={() => setOpen(false)} className="block">
                  Notifications
                </Link>
                <Link to="/reports" onClick={() => setOpen(false)} className="block">
                  Reports
                </Link>
              </div>

              <Link to="/profile" onClick={() => setOpen(false)} className="block">
                Profile
              </Link>

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="block text-yellow-300 font-semibold"
                >
                  Admin Panel
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left bg-red-600 px-3 py-1 rounded mt-2"
              >
                Logout
              </button>
            </>
          )}

          <Link to="/contact" onClick={() => setOpen(false)} className="block">
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
}
