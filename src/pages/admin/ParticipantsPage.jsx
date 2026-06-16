import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { listAllRegistrations, markAttendance } from "../../lib/eventService";
import { useAuth } from "../../state/AuthContext";

function getNormalizedStatus(row) {
  const attendance = Array.isArray(row.attendance) ? row.attendance[0] : row.attendance;
  const attendanceStatus = attendance?.status;
  if (attendanceStatus === "present" || row.attendance_status === "checked_in") return "checked_in";
  return "pending";
}

export default function ParticipantsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingId, setCheckingId] = useState("");

  useEffect(() => {
    listAllRegistrations()
      .then(setRows)
      .catch((e) => {
        setError(e.message || "Failed to load participants");
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (name) => {
    if (!name) return "—";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  async function handleMarkPresent(ticketCode) {
    setCheckingId(ticketCode);
    setError("");
    try {
      const updated = await markAttendance(ticketCode, user?.id || null);
      if (updated) {
        setRows((prev) =>
          prev.map((row) => {
            if (row.ticket_code === ticketCode) {
              return {
                ...row,
                attendance_status: "checked_in",
                attendance: [{ status: "present" }]
              };
            }
            return row;
          })
        );
      } else {
        setError("Failed to mark participant present: Ticket not found");
      }
    } catch (e) {
      setError(e.message || "Failed to mark participant present");
    } finally {
      setCheckingId("");
    }
  }

  const checkedInCount = rows.filter((r) => getNormalizedStatus(r) === "checked_in").length;
  const attendanceRate = rows.length > 0 ? Math.round((checkedInCount / rows.length) * 100) : 0;

  return (
    <AdminLayout
      title="Event Participants"
      subtitle="Overview"
      actions={
        <>
          <button
            className="bg-surface-container-low text-on-surface hover:bg-surface-container-high px-6 py-2.5 rounded-full font-label text-label-md font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
            title="Export CSV not implemented"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export CSV
          </button>
          <button
            className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-2.5 rounded-full font-label text-label-md font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
            title="Add Participant not implemented"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Add Participant
          </button>
        </>
      }
    >
      {error ? (
        <div className="mb-6 bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      ) : null}

      {/* Filters Section */}
      <div className="bg-surface-container-lowest rounded-xl p-6 mb-8 shadow-sm flex flex-wrap items-center gap-6 border border-surface-container">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-outline mb-2">Event</label>
          <select
            className="w-full bg-surface-container-highest border-none rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/40 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            <option>Global Tech Summit 2024</option>
            <option>Design Leadership Workshop</option>
            <option>AI Innovations Expo</option>
          </select>
        </div>
        <div className="w-48">
          <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-outline mb-2">Status</label>
          <select
            className="w-full bg-surface-container-highest border-none rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/40 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            <option>All Participants</option>
            <option>Present</option>
            <option>Absent</option>
            <option>Pending</option>
          </select>
        </div>
        <div className="w-48">
          <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-outline mb-2">Ticket Type</label>
          <select
            className="w-full bg-surface-container-highest border-none rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/40 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            <option>All Types</option>
            <option>VIP Pass</option>
            <option>Standard</option>
            <option>Early Bird</option>
          </select>
        </div>
        <div className="self-end pb-1">
          <button className="p-2.5 hover:bg-surface-container-low rounded-lg transition-colors disabled:opacity-50" disabled>
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container text-sm">
          Loading participants...
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-8 text-center border border-surface-container">
          <h2 className="text-xl font-bold mb-2">No participants yet</h2>
          <p className="text-on-surface-variant mb-5">Participants will appear here after users register for events.</p>
          <Link className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-full font-semibold text-sm" to="/admin/events">
            Go to Manage Events
          </Link>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-6 py-4 font-label text-[11px] font-bold uppercase tracking-widest text-outline">Participant</th>
                  <th className="px-6 py-4 font-label text-[11px] font-bold uppercase tracking-widest text-outline">Registration ID</th>
                  <th className="px-6 py-4 font-label text-[11px] font-bold uppercase tracking-widest text-outline">Reg. Date</th>
                  <th className="px-6 py-4 font-label text-[11px] font-bold uppercase tracking-widest text-outline text-center">QR Status</th>
                  <th className="px-6 py-4 font-label text-[11px] font-bold uppercase tracking-widest text-outline">Attendance</th>
                  <th className="px-6 py-4 font-label text-[11px] font-bold uppercase tracking-widest text-outline text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {rows.map((row) => {
                  const normalizedStatus = getNormalizedStatus(row);
                  const isCheckedIn = normalizedStatus === "checked_in";
                  return (
                    <tr className="hover:bg-surface-container-low transition-colors group" key={row.id}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            isCheckedIn ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-primary-fixed text-on-primary-fixed"
                          }`}>
                            {getInitials(row.participant_name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{row.participant_name || "Unknown"}</p>
                            <p className="text-[0.75rem] text-outline">—</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-mono text-sm font-medium text-on-surface-variant">{row.ticket_code || "—"}</span>
                      </td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant">
                        {row.created_at
                          ? new Date(row.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              year: "numeric"
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {isCheckedIn ? (
                          <span
                            className="material-symbols-outlined text-success-green text-green-600"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            verified
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-outline">hourglass_empty</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {isCheckedIn ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider">
                            Present
                          </span>
                        ) : (
                          <span className="bg-surface-container-highest text-outline px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider">
                            Absent
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          {!isCheckedIn && (
                            <button
                              className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                              onClick={() => handleMarkPresent(row.ticket_code)}
                              disabled={checkingId === row.ticket_code}
                            >
                              {checkingId === row.ticket_code ? "Checking..." : "Mark Present"}
                            </button>
                          )}
                          <button
                            className="p-2 hover:bg-error-container/20 rounded-full transition-colors text-error disabled:opacity-50 disabled:cursor-not-allowed opacity-50"
                            title="Remove"
                            disabled
                          >
                            <span className="material-symbols-outlined text-[20px]">person_remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination Section */}
          <div className="p-6 bg-surface-container-low flex items-center justify-between border-t border-surface-container">
            <p className="text-xs text-outline font-medium">
              Showing 1 to {rows.length} of {rows.length} participants
            </p>
            <div className="flex items-center gap-1">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">
                1
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats/Bento Grid Peek */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container border-l-4 border-l-primary">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-outline mb-1">Total Registered</p>
          <h3 className="text-2xl font-extrabold text-on-surface">{rows.length}</h3>
          <p className="text-[0.7rem] text-outline font-medium mt-2">Trend not tracked</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container border-l-4 border-l-secondary">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-outline mb-1">Checked In</p>
          <h3 className="text-2xl font-extrabold text-on-surface">{checkedInCount}</h3>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-4">
            <div className="bg-secondary h-1.5 rounded-full" style={{ width: `${attendanceRate}%` }}></div>
          </div>
          <p className="text-[0.7rem] text-outline font-medium mt-2">{attendanceRate}% attendance rate</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-container border-l-4 border-l-tertiary-container">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-outline mb-1">VIP Attendees</p>
          <h3 className="text-2xl font-extrabold text-on-surface">—</h3>
          <p className="text-[0.7rem] text-outline font-medium mt-2">Not tracked</p>
        </div>
      </div>
    </AdminLayout>
  );
}
