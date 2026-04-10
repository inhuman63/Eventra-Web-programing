import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { deleteEvent, listAdminEvents } from "../../lib/eventService";

export default function ManageEventsPage() {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    listAdminEvents()
      .then(setEvents)
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
    <AdminLayout subtitle="Track and manage all events" title="Manage Events">
      {location.state?.message ? <div className="mb-4 bg-primary-fixed text-on-primary-fixed px-4 py-3 rounded-lg">{location.state.message}</div> : null}
      {error ? <div className="mb-4 bg-error-container text-on-error-container px-4 py-3 rounded-lg">{error}</div> : null}
      {loading ? <div className="bg-white rounded-xl p-6">Loading events...</div> : null}
      {!loading && events.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">No events created yet</h2>
          <p className="text-on-surface-variant mb-5">Create your first event to start collecting registrations.</p>
          <Link className="premium-gradient text-white px-6 py-3 rounded-full font-semibold" to="/admin/events/new">
            Add Event
          </Link>
        </div>
      ) : null}
      {!loading && events.length > 0 ? (
      <div className="bg-white rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low text-left text-xs uppercase tracking-widest text-on-surface-variant">
              <th className="p-4">Event</th>
              <th className="p-4">Date</th>
              <th className="p-4">Venue</th>
              <th className="p-4">Capacity</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr className="border-t border-surface-container" key={event.id}>
                <td className="p-4 font-semibold">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{event.title || "Untitled Event"}</span>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-bold ${event.is_active === false ? "bg-slate-200 text-slate-700" : "bg-green-100 text-green-700"}`}>
                      {event.is_active === false ? "Inactive" : "Active"}
                    </span>
                  </div>
                </td>
                <td className="p-4">{event.date ? new Date(event.date).toDateString() : "Date TBD"}</td>
                <td className="p-4">{event.venue || "Venue TBD"}</td>
                <td className="p-4">{event.capacity}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-3">
                    <Link className="text-primary font-bold" to={`/events/${event.id}`}>View</Link>
                    <Link className="text-slate-700 font-semibold" to={`/admin/events/${event.id}/edit`}>Edit</Link>
                    <button
                      className="text-error font-semibold"
                      disabled={deletingId === event.id}
                      onClick={() => handleDelete(event.id)}
                      type="button"
                    >
                      {deletingId === event.id ? "Deleting..." : "Delete"}
                    </button>
                    <Link className="text-slate-700 font-semibold" to="/admin/participants">Participants</Link>
                    <Link className="text-slate-700 font-semibold" to="/admin/scanner">Scanner</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : null}
    </AdminLayout>
  );
}
