import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { deleteEvent, listAdminEvents, getManageEventsAnalytics } from "../../lib/eventService";

export default function ManageEventsPage() {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [analytics, setAnalytics] = useState({ liveRegistrations: 0, peakEventTitle: "—", peakEventCapacityRate: 0 });

  useEffect(() => {
    Promise.all([listAdminEvents(), getManageEventsAnalytics()])
      .then(([eventRows, analyticsData]) => {
        setEvents(eventRows);
        setAnalytics(analyticsData);
      })
      .catch((e) => setError(e.message || "Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(eventId) {
    const confirmed = window.confirm("Delete this event? This will also remove linked registrations.");
    if (!confirmed) return;

    setDeletingId(eventId);
    setError("");
    try {
      await deleteEvent(eventId);
      setEvents((prev) => prev.filter((item) => item.id !== eventId));
    } catch (e) {
      setError(e.message || "Failed to delete event");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <AdminLayout
      title="Manage Events"
      subtitle="Curate and oversee your upcoming schedule. Monitor real-time registrations and venue capacities from a single command center."
      actions={
        <Link
          className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all active:scale-95 text-sm"
          to="/admin/events/new"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          Create New Event
        </Link>
      }
    >
      {location.state?.message ? <div className="mb-6 bg-primary-fixed text-on-primary-fixed px-4 py-3 rounded-lg text-sm">{location.state.message}</div> : null}
      {error ? <div className="mb-6 bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm">{error}</div> : null}

      {/* Stats Overview (Asymmetric Bento) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="md:col-span-1 bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
          <span className="text-xs font-label uppercase tracking-widest text-slate-500 mb-4">Total Events</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-on-surface">{events.length}</span>
            <span className="text-green-600 text-sm font-bold flex items-center">+12%</span>
          </div>
        </div>
        <div className="md:col-span-1 bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
          <span className="text-xs font-label uppercase tracking-widest text-slate-500 mb-4">Live Registrations</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-on-surface">{analytics.liveRegistrations}</span>
            <span className="text-green-600 text-sm font-bold flex items-center">Live</span>
          </div>
        </div>
        <div className="md:col-span-2 bg-gradient-to-br from-secondary to-secondary-container p-6 rounded-xl shadow-sm text-white relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs font-label uppercase tracking-widest opacity-80 mb-4 block">Peak Performance</span>
            <h3 className="text-xl font-bold mb-1 truncate max-w-[90%]">{analytics.peakEventTitle}</h3>
            <p className="text-sm opacity-90 mb-4">{analytics.peakEventCapacityRate}% Capacity reached for peak event.</p>
            <div className="flex gap-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">Active</span>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12">
            <span className="material-symbols-outlined text-9xl">auto_awesome</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-low p-4 rounded-xl mb-6 flex flex-wrap items-center gap-4 border border-surface-container">
        <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg text-sm text-on-surface-variant font-medium opacity-50 cursor-not-allowed">
          <span className="material-symbols-outlined text-sm">filter_list</span>
          All Types
        </div>
        <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg text-sm text-on-surface-variant font-medium opacity-50 cursor-not-allowed">
          <span className="material-symbols-outlined text-sm">calendar_today</span>
          Next 30 Days
        </div>
        <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg text-sm text-on-surface-variant font-medium opacity-50 cursor-not-allowed">
          <span className="material-symbols-outlined text-sm">location_on</span>
          All Venues
        </div>
        <div className="ml-auto text-xs text-slate-500 font-medium">
          Showing {events.length} events
        </div>
      </div>

      {/* Main Data Table Container */}
      {loading ? (
        <div className="bg-white rounded-xl p-6 border border-surface-container text-sm">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-surface-container">
          <h2 className="text-xl font-bold mb-2">No events created yet</h2>
          <p className="text-on-surface-variant mb-5">Create your first event to start collecting registrations.</p>
          <Link className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-full font-semibold text-sm" to="/admin/events/new">
            Add Event
          </Link>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-surface-container">
                  <th className="px-6 py-4 text-xs font-label uppercase tracking-widest text-slate-600 font-bold">Event Details</th>
                  <th className="px-6 py-4 text-xs font-label uppercase tracking-widest text-slate-600 font-bold">Date &amp; Venue</th>
                  <th className="px-6 py-4 text-xs font-label uppercase tracking-widest text-slate-600 font-bold text-center">Registrations</th>
                  <th className="px-6 py-4 text-xs font-label uppercase tracking-widest text-slate-600 font-bold">Status</th>
                  <th className="px-6 py-4 text-xs font-label uppercase tracking-widest text-slate-600 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {events.map((event) => {
                  const isInactive = event.is_active === false;
                  return (
                    <tr className="hover:bg-surface-container-low/50 transition-colors" key={event.id}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {event.image_url ? (
                            <img className="w-12 h-12 rounded-lg object-cover shadow-sm" src={event.image_url} alt={event.title} />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
                              <span className="material-symbols-outlined text-slate-400">image_not_supported</span>
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-on-surface">{event.title || "Untitled Event"}</div>
                            <div className="text-xs text-on-surface-variant font-mono">ID: #{event.id.slice(0, 8).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-on-surface">
                          {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : "Date TBD"}
                        </div>
                        <div className="text-xs text-on-surface-variant">{event.venue || "Venue TBD"}</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center">
                          <div className="text-sm font-bold text-on-surface">— / {event.capacity}</div>
                          <div className="w-24 h-1.5 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
                            <div className="bg-primary h-full w-0"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                          isInactive ? "bg-surface-dim text-on-surface" : "bg-primary-fixed text-on-primary-fixed-variant"
                        }`}>
                          {isInactive ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <Link className="p-2 hover:bg-surface-container-high rounded-full transition-all text-on-surface-variant flex items-center" title="View Event Page" to={`/events/${event.id}`}>
                            <span className="material-symbols-outlined text-xl">visibility</span>
                          </Link>
                          <Link className="p-2 hover:bg-surface-container-high rounded-full transition-all text-on-surface-variant flex items-center" title="Edit Event" to={`/admin/events/${event.id}/edit`}>
                            <span className="material-symbols-outlined text-xl">edit_note</span>
                          </Link>
                          <button
                            className="p-2 hover:bg-error-container/20 rounded-full transition-all text-error flex items-center disabled:opacity-50"
                            disabled={deletingId === event.id}
                            onClick={() => handleDelete(event.id)}
                            title="Delete Event"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-xl">
                              {deletingId === event.id ? "hourglass_empty" : "delete"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions Secondary */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-surface-container-highest rounded-2xl flex items-center gap-4 opacity-50 cursor-not-allowed">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
          </div>
          <div>
            <h4 className="font-bold text-on-surface">Export Data</h4>
            <p className="text-xs text-on-surface-variant">Download all event manifests (.csv)</p>
          </div>
        </div>
        <div className="p-6 bg-surface-container-highest rounded-2xl flex items-center gap-4 opacity-50 cursor-not-allowed">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
          </div>
          <div>
            <h4 className="font-bold text-on-surface">Bulk Notification</h4>
            <p className="text-xs text-on-surface-variant">Message all registered attendees</p>
          </div>
        </div>
        <div className="p-6 bg-surface-container-highest rounded-2xl flex items-center gap-4 opacity-50 cursor-not-allowed">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-tertiary-container">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
          </div>
          <div>
            <h4 className="font-bold text-on-surface">Promo Codes</h4>
            <p className="text-xs text-on-surface-variant">Manage active discounts &amp; vouchers</p>
          </div>
        </div>
      </div>

      {/* Contextual Footer Metadata */}
      <footer className="p-8 border-t border-slate-200 mt-12 bg-surface">
        <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
          <div>© 2024 Eventra Orchestrator. All rights reserved.</div>
          <div className="flex gap-4">
            <a className="hover:text-primary transition-colors" href="#">Documentation</a>
            <a className="hover:text-primary transition-colors" href="#">Support Portal</a>
            <a className="hover:text-primary transition-colors" href="#">API Status</a>
          </div>
        </div>
      </footer>
    </AdminLayout>
  );
}
