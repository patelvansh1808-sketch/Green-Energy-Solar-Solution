import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const navItems = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/subsidy-applications", label: "Subsidy Applications" },
  { to: "/admin/finance", label: "Financial Analytics" },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/tickets", label: "Tickets" },
  { to: "/admin/roles", label: "Role Management" },
];

const crmItems = [
  { to: "/crm/dashboard", label: "CRM Dashboard" },
  { to: "/crm/sales-dashboard", label: "Sales Pipeline" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };

    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-2">
          <span className="text-xl">☀️</span>
          <span className="text-lg font-bold text-gray-900">Solar CRM</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? "bg-orange-50 text-orange-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="pt-4">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              CRM
            </p>
            {crmItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `mt-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? "bg-orange-50 text-orange-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-900">
              {user?.name || "Admin"}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex-1 overflow-y-auto h-screen flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">{new Date().toLocaleDateString()}</div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpenMenu((prev) => !prev)}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
                aria-label="Open settings"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.82-.33 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .33-1.82 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.82.33H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.33 1.82V9c0 .68.39 1.3 1 1.55.2.08.41.12.62.12H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.55 1Z" />
                </svg>
              </button>
              {openMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      navigate("/admin/profile");
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <span className="w-5 h-5 text-indigo-600">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20a8 8 0 0 1 16 0" />
                      </svg>
                    </span>
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3"
                  >
                    <span className="w-5 h-5 text-red-600">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
                        <path d="M17 16l4-4-4-4" />
                        <path d="M21 12H10" />
                      </svg>
                    </span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
