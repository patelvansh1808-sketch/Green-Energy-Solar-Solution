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
    navigate("/login");
  };

  return (
    <nav className="bg-green-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/favicon.png"
            alt="SuryaUrja"
            className="h-8 w-8"
          />
          <span className="text-lg md:text-xl font-bold">
            SuryaUrja
          </span>
        </Link>

        {/* ===== DESKTOP MENU ===== */}
        <div className="hidden md:flex gap-6 text-sm font-medium items-center">
          <Link to="/" className="hover:text-green-200">Home</Link>

          {user && (
            <>
              <Link to="/dashboard" className="hover:text-green-200">
                Dashboard
              </Link>

              <Link to="/analytics" className="hover:text-green-200">
                Analytics
              </Link>

              {/* ✅ PREDICTION ADDED */}
              <Link to="/prediction" className="hover:text-green-200">
                Prediction
              </Link>

              <Link to="/booking" className="hover:text-green-200">
                Booking
              </Link>

              <Link to="/subsidy" className="hover:text-green-200">
                Subsidy
              </Link>

              <Link to="/profile" className="hover:text-green-200">
                Profile
              </Link>

              {/* ADMIN MENU */}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-yellow-300 font-semibold hover:text-yellow-400"
                >
                  Admin Panel
                </Link>
              )}
            </>
          )}

          <Link to="/contact" className="hover:text-green-200">
            Contact
          </Link>

          {!user ? (
            <>
              <Link to="/login" className="hover:text-green-200">
                Login
              </Link>
              <Link to="/register" className="hover:text-green-200">
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          )}
        </div>

        {/* ===== MOBILE HAMBURGER ===== */}
        <button
          className="md:hidden focus:outline-none"
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

              <Link to="/analytics" onClick={() => setOpen(false)} className="block">
                Analytics
              </Link>

              {/* ✅ PREDICTION (MOBILE) */}
              <Link to="/prediction" onClick={() => setOpen(false)} className="block">
                Prediction
              </Link>

              <Link to="/booking" onClick={() => setOpen(false)} className="block">
                Booking
              </Link>

              <Link to="/subsidy" onClick={() => setOpen(false)} className="block">
                Subsidy
              </Link>

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
            </>
          )}

          <Link to="/contact" onClick={() => setOpen(false)} className="block">
            Contact
          </Link>

          {user && (
            <button
              onClick={handleLogout}
              className="w-full text-left bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
