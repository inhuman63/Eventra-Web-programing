import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", icon: "dashboard" },
  { to: "/admin/events", label: "Events", icon: "calendar_month" },
  { to: "/admin/events/new", label: "Add Event", icon: "add_circle" },
  { to: "/admin/participants", label: "Participants", icon: "group" },
  { to: "/admin/scanner", label: "Attendance Scanner", icon: "qr_code_scanner" },
  { to: "/admin/report", label: "Attendance Report", icon: "analytics" }
];

export default function AdminLayout({ children, title, subtitle, actions }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-slate-50 z-40">
        <div className="p-6">
          <Link className="text-xl font-bold text-slate-900 font-headline" to="/admin">
            Admin Panel
          </Link>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Event Management</p>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-2">
          {links.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `${isActive ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-100"} rounded-lg px-4 py-3 flex items-center gap-3 transition-all font-label uppercase tracking-widest font-bold`
              }
              key={item.to}
              to={item.to}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4">
          <button
            className="w-full text-left text-slate-500 px-4 py-3 hover:bg-slate-100 rounded-lg flex items-center gap-3 transition-all font-label uppercase tracking-widest font-bold"
            onClick={handleLogout}
            type="button"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 h-16 flex items-center justify-between px-8">
          <div>
            <h1 className="text-xl font-headline font-bold">{title}</h1>
            {subtitle ? <p className="text-sm text-on-surface-variant">{subtitle}</p> : null}
          </div>
          <div className="flex gap-3">{actions}</div>
        </header>
        <div className="px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
