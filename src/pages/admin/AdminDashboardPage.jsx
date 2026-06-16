import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { listAdminEvents, listAllRegistrations, getDashboardAnalytics } from "../../lib/eventService";

export default function AdminDashboardPage() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState({ flowData: [], peakDay: "—", peakCount: 0, attendanceToday: 0 });

  useEffect(() => {
    Promise.all([listAdminEvents(), listAllRegistrations(), getDashboardAnalytics()])
      .then(([eventRows, regRows, analyticsData]) => {
        setEvents(eventRows);
        setRegistrations(regRows);
        setAnalytics(analyticsData);
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

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => e.is_active !== false && e.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  }, [events]);

  return (
    <AdminLayout
      title="Executive Dashboard"
      subtitle="Real-time overview of Eventra's active operations."
      actions={
        <div className="flex gap-3">
          <Link
            className="bg-primary text-white px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold shadow-sm hover:opacity-90 transition-all text-sm"
            to="/admin/events/new"
          >
            <span className="material-symbols-outlined">add</span>
            New Event
          </Link>
          <button
            className="bg-surface-container-highest text-on-surface px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold hover:bg-surface-container-high transition-all text-sm opacity-50 cursor-not-allowed"
            type="button"
            disabled
          >
            <span className="material-symbols-outlined">download</span>
            Export Reports
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-6 bg-error-container text-on-error-container px-6 py-4 rounded-xl shadow-sm border border-error/20 flex items-center gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary-fixed rounded-lg">
              <span className="material-symbols-outlined text-primary">event</span>
            </div>
            <span className="text-xs font-bold text-green-600 font-label uppercase">+12%</span>
          </div>
          <div>
            <p className="text-3xl font-headline font-extrabold">{events.length}</p>
            <p className="text-sm font-label uppercase tracking-widest text-on-surface-variant font-bold">Total Events</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] flex flex-col justify-between border-t-4 border-primary">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary-fixed rounded-lg">
              <span className="material-symbols-outlined text-secondary">how_to_reg</span>
            </div>
            <span className="text-xs font-bold text-green-600 font-label uppercase">+24%</span>
          </div>
          <div>
            <p className="text-3xl font-headline font-extrabold">{registrations.length}</p>
            <p className="text-sm font-label uppercase tracking-widest text-on-surface-variant font-bold">Registrations</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary-fixed rounded-lg">
              <span className="material-symbols-outlined text-primary">person_celebrate</span>
            </div>
            <span className="text-xs font-bold text-green-600 font-label uppercase">+8%</span>
          </div>
          <div>
            <p className="text-3xl font-headline font-extrabold">{checkedIn}</p>
            <p className="text-sm font-label uppercase tracking-widest text-on-surface-variant font-bold">Active Participants</p>
          </div>
        </div>

        <div className="bg-primary text-white p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(0,61,155,0.2)] flex flex-col justify-between bg-gradient-to-br from-primary to-primary-container">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <span className="material-symbols-outlined text-white">done_all</span>
            </div>
            <span className="text-xs font-bold font-label uppercase text-primary-fixed">Live</span>
          </div>
          <div>
            <p className="text-3xl font-headline font-extrabold">{analytics.attendanceToday}</p>
            <p className="text-sm font-label uppercase tracking-widest text-primary-fixed font-bold">Attendance Today</p>
            <p className="text-[10px] text-primary-fixed opacity-70">Verified check-ins today</p>
          </div>
        </div>
      </div>

      {/* Dashboard Insights Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registrations Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-headline font-bold">Recent Registrations</h3>
            <Link to="/admin/participants" className="text-primary text-sm font-bold hover:underline">
              View All
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-on-surface-variant text-sm">Loading registrations...</div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant text-sm">No registrations available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-on-surface-variant border-b border-surface-container-high">
                    <th className="pb-4 font-label uppercase text-[10px] tracking-widest font-bold">Participant</th>
                    <th className="pb-4 font-label uppercase text-[10px] tracking-widest font-bold">Event Name</th>
                    <th className="pb-4 font-label uppercase text-[10px] tracking-widest font-bold">Date</th>
                    <th className="pb-4 font-label uppercase text-[10px] tracking-widest font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {registrations.slice(0, 5).map((r) => (
                    <tr className="group hover:bg-surface-container-low/50 transition-colors" key={r.id}>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary text-xs font-bold">
                            {getInitials(r.participant_name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{r.participant_name || "Unknown"}</p>
                            <p className="text-[11px] text-on-surface-variant">—</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm font-medium">{r.event?.title || "Unknown Event"}</td>
                      <td className="py-4 text-sm text-on-surface-variant">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                      </td>
                      <td className="py-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          r.attendance_status === "checked_in" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {r.attendance_status === "checked_in" ? "Confirmed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Insights */}
        <div className="space-y-8">
          {/* Attendance Overview Chart */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-headline font-bold">Attendance Flow</h3>
              <span className="material-symbols-outlined text-outline">more_vert</span>
            </div>
            <div className="h-40 flex items-end gap-2 px-2 relative">
              {analytics.flowData.map((item) => {
                const maxCount = Math.max(...analytics.flowData.map((d) => d.check_ins_count), 1);
                const heightPct = Math.round((item.check_ins_count / maxCount) * 100);
                const isPeak = item.day_of_week === analytics.peakDay;
                return (
                  <div
                    key={item.day_of_week}
                    className={`flex-1 rounded-t-lg transition-all ${
                      isPeak ? "bg-primary" : "bg-surface-container-highest hover:bg-primary-fixed"
                    }`}
                    style={{ height: `${Math.max(heightPct, 5)}%` }}
                    title={`${item.day_of_week}: ${item.check_ins_count} check-ins`}
                  ></div>
                );
              })}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-on-surface-variant font-label px-2">
              {analytics.flowData.map((item) => (
                <span key={item.day_of_week}>{item.day_of_week.toUpperCase()}</span>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-xs font-semibold">Peak: {analytics.peakCount} ({analytics.peakDay})</span>
              </div>
              <span className="text-xs text-primary font-bold">Real-time</span>
            </div>
          </div>

          {/* Upcoming Events List */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-headline font-bold">Upcoming Events</h3>
              <Link to="/admin/events/new" className="material-symbols-outlined text-outline hover:text-primary transition-colors">
                add_circle
              </Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-6 text-on-surface-variant text-xs">No upcoming events found</div>
            ) : (
              <div className="space-y-6">
                {upcomingEvents.map((event) => {
                  const eventDate = new Date(event.date);
                  const month = eventDate.toLocaleDateString("en-US", { month: "short" });
                  const day = eventDate.toLocaleDateString("en-US", { day: "2-digit" });
                  return (
                    <div className="flex items-center gap-4" key={event.id}>
                      <div className="w-12 h-12 rounded-lg bg-surface-container-high flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold font-label uppercase">{month}</span>
                        <span className="text-lg font-extrabold leading-none">{day}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold truncate">{event.title || "Untitled Event"}</h4>
                        <p className="text-xs text-on-surface-variant truncate">{event.venue || "Venue TBD"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Link
              to="/admin/events"
              className="w-full mt-8 py-3 rounded-full border border-outline-variant text-sm font-bold hover:bg-surface-container-low transition-all block text-center"
            >
              View Calendar
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
