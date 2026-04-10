import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function PublicNav() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <Link className="text-2xl font-black tracking-tighter text-blue-700" to="/">
          Eventra
        </Link>
        <div className="hidden md:flex items-center gap-8 font-manrope font-semibold tracking-tight">
          <NavLink className="text-slate-600 hover:text-blue-600" to="/">Home</NavLink>
          <NavLink className="text-slate-600 hover:text-blue-600" to="/events">Events</NavLink>
          {!user && <NavLink className="text-slate-600 hover:text-blue-600" to="/login">Login</NavLink>}
          {!user && (
            <NavLink className="bg-primary text-white px-6 py-2 rounded-full" to="/signup">
              Register
            </NavLink>
          )}
          {user && role === "user" && (
            <NavLink className="text-slate-600 hover:text-blue-600" to="/dashboard">
              My Dashboard
            </NavLink>
          )}
          {user && role === "admin" && (
            <NavLink className="text-slate-600 hover:text-blue-600" to="/admin">
              Admin
            </NavLink>
          )}
          {user && (
            <button className="text-slate-600 hover:text-blue-600" onClick={handleLogout} type="button">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
