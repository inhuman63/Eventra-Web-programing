import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { listAllRegistrations } from "../../lib/eventService";

export default function AttendanceReportPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listAllRegistrations()
      .then(setRows)
      .catch((e) => {
        setError(e.message || "Failed to load attendance report");
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const report = useMemo(() => {
    const isPresent = (row) => {
      const attendance = Array.isArray(row.attendance) ? row.attendance[0] : row.attendance;
      return attendance?.status === "present" || row.attendance_status === "checked_in";
    };

    const total = rows.length;
    const checked = rows.filter((row) => isPresent(row)).length;
    const pending = total - checked;
    const rate = total ? Math.round((checked / total) * 100) : 0;
    return { total, checked, pending, rate };
  }, [rows]);

  return (
    <AdminLayout subtitle="Export-ready attendance overview" title="Attendance Report">
      {error ? <div className="mb-6 bg-error-container text-on-error-container px-4 py-3 rounded-lg">{error}</div> : null}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <Card label="Total Tickets" value={report.total} />
        <Card label="Checked In" value={report.checked} />
        <Card label="Pending" value={report.pending} />
        <Card label="Attendance Rate" value={`${report.rate}%`} />
      </div>

      {loading ? <div className="bg-white rounded-xl p-6 mb-6">Loading attendance data...</div> : null}
      {!loading && rows.length === 0 ? (
        <div className="bg-white rounded-xl p-8 mb-6 text-center">
          <h2 className="text-xl font-bold mb-2">No attendance data yet</h2>
          <p className="text-on-surface-variant mb-5">Once participants register and check in, this report will update automatically.</p>
          <Link className="bg-surface-container-low px-6 py-3 rounded-full font-semibold" to="/admin/participants">
            View Participants
          </Link>
        </div>
      ) : null}

      <div className="bg-white rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Attendance Breakdown</h2>
        <div className="h-4 rounded-full bg-surface-container-high overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${report.rate}%` }}></div>
        </div>
        <p className="text-sm text-on-surface-variant mt-3">Current check-in rate: {report.rate}% of registered participants.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="premium-gradient text-white px-5 py-2 rounded-full font-semibold" to="/admin/scanner">
            Start Scanning
          </Link>
          <Link className="bg-surface-container-low px-5 py-2 rounded-full font-semibold" to="/admin/participants">
            Open Participant List
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-white p-6 rounded-xl">
      <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">{label}</p>
      <p className="text-3xl font-headline font-extrabold mt-2">{value}</p>
    </div>
  );
}
