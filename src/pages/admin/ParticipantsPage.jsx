import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { listAllRegistrations } from "../../lib/eventService";

function getNormalizedStatus(row) {
  const attendance = Array.isArray(row.attendance) ? row.attendance[0] : row.attendance;
  const attendanceStatus = attendance?.status;
  if (attendanceStatus === "present" || row.attendance_status === "checked_in") return "checked_in";
  return "pending";
}

export default function ParticipantsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listAllRegistrations()
      .then(setRows)
      .catch((e) => {
        setError(e.message || "Failed to load participants");
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout subtitle="Participants and attendance state" title="Participants">
      {error ? <div className="mb-5 bg-error-container text-on-error-container px-4 py-3 rounded-lg">{error}</div> : null}
      <div className="mb-5 flex flex-wrap gap-3">
        <Link className="premium-gradient text-white px-5 py-2 rounded-full font-semibold" to="/admin/scanner">
          Open Scanner
        </Link>
        <Link className="bg-surface-container-low px-5 py-2 rounded-full font-semibold" to="/admin/report">
          View Report
        </Link>
      </div>
      {loading ? <div className="bg-white rounded-xl p-6">Loading participants...</div> : null}
      {!loading && rows.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">No participants yet</h2>
          <p className="text-on-surface-variant mb-5">Participants will appear here after users register for events.</p>
          <Link className="premium-gradient text-white px-6 py-3 rounded-full font-semibold" to="/admin/events">
            Go to Manage Events
          </Link>
        </div>
      ) : null}
      {!loading && rows.length > 0 ? <div className="bg-white rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container-low text-left text-xs uppercase tracking-widest text-on-surface-variant">
              <th className="p-4">Ticket</th>
              <th className="p-4">Event</th>
              <th className="p-4">Status</th>
              <th className="p-4">Registered At</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const normalizedStatus = getNormalizedStatus(row);
              return (
              <tr className="border-t border-surface-container" key={row.id}>
                <td className="p-4 font-semibold">{row.ticket_code}</td>
                <td className="p-4">{row.event?.title || row.event_id}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${normalizedStatus === "checked_in" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {normalizedStatus === "checked_in" ? "Checked In" : "Pending"}
                  </span>
                </td>
                <td className="p-4">{new Date(row.created_at).toLocaleString()}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div> : null}
    </AdminLayout>
  );
}
