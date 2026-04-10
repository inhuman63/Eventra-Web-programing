import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { listAdminEvents, listAllRegistrations } from "../../lib/eventService";

export default function AdminDashboardPage() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([listAdminEvents(), listAllRegistrations()])
      .then(([eventRows, regRows]) => {
        setEvents(eventRows);
        setRegistrations(regRows);
      })
      .catch((e) => setError(e.message || "Failed to load admin dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  const activeEvents = events.filter((event) => event.is_active !== false).length;
  const checkedIn = registrations.filter((r) => {
    const attendance = Array.isArray(r.attendance) ? r.attendance[0] : r.attendance;
    return r.attendance_status === "checked_in" || attendance?.status === "present";
  }).length;
  const attendanceRate = registrations.length ? Math.round((checkedIn / registrations.length) * 100) : 0;

  return (
    <AdminLayout
      actions={
        <Link className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-full font-semibold flex items-center gap-2" to="/admin/events/new">
          <span className="material-symbols-outlined">add</span>
          New Event
        </Link>
      }
      subtitle="Real-time overview of Eventra's active operations"
      title="Executive Dashboard"
    >
      {error && (
        <div className="mb-6 bg-error-container text-on-error-container px-6 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard icon="event" label="Total Events" value={events.length} trend="+12%" />
        <StatCard icon="calendar_today" label="Active Events" value={activeEvents} trend="" />
        <StatCard icon="how_to_reg" label="Registrations" value={registrations.length} trend="+24%" highlight />
        <StatCard icon="assignment_turned_in" label="Attendance Rate" value={`${attendanceRate}%`} trend="+8%" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Registrations */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Registrations</h2>
            <Link to="/admin/participants" className="text-primary font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-on-surface-variant">Loading registrations...</div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-on-surface-variant">No registrations yet</p>
              <p className="text-xs text-on-surface-variant mt-1">Share event links to collect registrations</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-container">
              {registrations.slice(0, 5).map((r) => (
                <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0" key={r.id}>
                  <div>
                    <p className="font-semibold text-on-surface">{r.participant_name || "Unknown"}</p>
                    <p className="text-xs text-on-surface-variant">{r.event?.title || "Unknown Event"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-primary-fixed text-on-primary-fixed text-xs font-bold px-2 py-1 rounded">
                      {r.ticket_code || "No Ticket"}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      r.attendance_status === "checked_in" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {r.attendance_status === "checked_in" ? "CHECKED IN" : "PENDING"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/admin/scanner"
              className="flex items-center gap-3 p-4 bg-primary text-white rounded-lg hover:bg-primary-container transition-all font-semibold"
            >
              <span className="material-symbols-outlined">qr_code_scanner</span>
              <span>Check-In Scanner</span>
            </Link>
            <Link
              to="/admin/events/new"
              className="flex items-center gap-3 p-4 bg-secondary text-white rounded-lg hover:bg-secondary-container transition-all font-semibold"
            >
              <span className="material-symbols-outlined">add</span>
              <span>Create Event</span>
            </Link>
            <Link
              to="/admin/participants"
              className="flex items-center gap-3 p-4 bg-surface-container-high text-on-surface rounded-lg hover:bg-surface-container-highest transition-all font-semibold"
            >
              <span className="material-symbols-outlined">people</span>
              <span>Manage Participants</span>
            </Link>
            <Link
              to="/admin/report"
              className="flex items-center gap-3 p-4 bg-surface-container-high text-on-surface rounded-lg hover:bg-surface-container-highest transition-all font-semibold"
            >
              <span className="material-symbols-outlined">analytics</span>
              <span>View Reports</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <div className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-12 text-center border border-primary/20">
          <span className="material-symbols-outlined text-6xl text-primary mb-4 block">calendar_blank</span>
          <h3 className="text-2xl font-bold mb-2">No events yet</h3>
          <p className="text-on-surface-variant mb-6">Create your first event to start managing registrations and attendance.</p>
          <Link
            to="/admin/events/new"
            className="premium-gradient text-white px-8 py-3 rounded-full font-semibold inline-flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            Create First Event
          </Link>
        </div>
      )}
    </AdminLayout>
  );
}

function StatCard({ icon, label, value, trend, highlight }) {
  return (
    <div className={`p-6 rounded-xl transition-all ${highlight ? "premium-gradient text-white" : "bg-white"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`material-symbols-outlined text-4xl ${highlight ? "text-white" : "text-primary"}`}>
          {icon}
        </span>
        {trend && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{trend}</span>}
      </div>
      <p className={`text-sm font-semibold mb-1 ${highlight ? "text-white/80" : "text-on-surface-variant"}`}>
        {label}
      </p>
      <p className={`text-3xl font-bold font-headline ${highlight ? "text-white" : "text-on-surface"}`}>
        {value}
      </p>
    </div>
  );
}
