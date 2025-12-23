import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo + Name */}
        <div className="flex items-center gap-2">
          <img
            src="/favicon.png"
            alt="SuryaUrja"
            className="h-7 w-7"
          />
          <span className="text-lg md:text-xl font-bold">
            SuryaUrja
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-green-200">
            Home
          </Link>
          <Link to="/dashboard" className="hover:text-green-200">
            Dashboard
          </Link>
          <Link to="/booking" className="hover:text-green-200">
            Booking
          </Link>
          <Link to="/subsidy" className="hover:text-green-200">
            Subsidy
          </Link>
          <Link to="/contact" className="hover:text-green-200">
            Contact
          </Link>
        </div>

        {/* Mobile Hamburger */}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-green-600 px-4 py-3 space-y-3 text-sm">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="block hover:text-green-200"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="block hover:text-green-200"
          >
            Dashboard
          </Link>
          <Link
            to="/booking"
            onClick={() => setOpen(false)}
            className="block hover:text-green-200"
          >
            Booking
          </Link>
          <Link
            to="/subsidy"
            onClick={() => setOpen(false)}
            className="block hover:text-green-200"
          >
            Subsidy
          </Link>
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="block hover:text-green-200"
          >
            Contact
          </Link>
          <Link to="/Profile" className="hover:text-green-200">
  Profile
</Link>

        </div>
      )}
    </nav>
  );
}
