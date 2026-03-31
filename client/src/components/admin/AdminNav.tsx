import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/agents", label: "RSS Agents" },
  { to: "/admin/ads", label: "Ad Campaigns" },
  { to: "/admin/stats", label: "Analytics" },
];

export default function AdminNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-56 flex-shrink-0 bg-gray-900 min-h-screen flex flex-col">
      <div className="px-6 py-5 border-b border-gray-700">
        <h2 className="text-white font-bold text-lg">NewsApp</h2>
        <p className="text-gray-400 text-xs mt-0.5">Admin Panel</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-red-400 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
