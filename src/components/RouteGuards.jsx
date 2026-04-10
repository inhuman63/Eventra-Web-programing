import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="p-10">Loading...</div>;
  if (!user || role !== "admin") return <Navigate to="/login" replace />;
  return children;
}
