import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { listAllRegistrations, getAttendanceReportAnalytics } from "../../lib/eventService";

export default function AttendanceReportPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    Promise.all([listAllRegistrations(), getAttendanceReportAnalytics("all")])
      .then(([regRows, hourlyFlow]) => {
        setRows(regRows);
        setHourlyData(hourlyFlow);
      })
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

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <AdminLayout subtitle="Export-ready attendance overview" title="Attendance Report">
      {error ? <div className="mb-6 bg-error-container text-on-error-container px-4 py-3 rounded-lg">{error}</div> : null}

      {/* Filters & Bento Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Filters Panel */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-xl flex flex-wrap items-end gap-6 border border-surface-container">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Select Event</label>
            <select className="w-full bg-surface-container-highest border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/40 opacity-50 cursor-not-allowed" disabled>
              <option>Global Tech Innovators Summit 2024</option>
              <option>Annual Design Excellence Awards</option>
              <option>Cybersecurity Workshop Series</option>
            </select>
          </div>
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Date Range</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">calendar_today</span>
              <input className="w-full bg-surface-container-highest border-none rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/40 opacity-50 cursor-not-allowed" type="text" value="Oct 12, 2024 - Oct 15, 2024" readOnly disabled/>
            </div>
          </div>
          <button className="bg-surface-container-high text-on-surface font-bold px-6 py-3 rounded-lg opacity-50 cursor-not-allowed" disabled>
            Apply Filters
          </button>
        </div>

        {/* Stats Cards */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-primary">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Total Reg</p>
          <h3 className="text-3xl font-black font-headline">{report.total}</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            Total registration count
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-secondary">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Present</p>
          <h3 className="text-3xl font-black font-headline text-secondary">{report.checked}</h3>
          <p className="text-xs text-on-surface-variant mt-2 italic">Verified check-ins</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-error">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Absent</p>
          <h3 className="text-3xl font-black font-headline text-error">{report.pending}</h3>
          <p className="text-xs text-on-surface-variant mt-2">Pending check-in status</p>
        </div>

        <div className="bg-gradient-to-br from-primary to-secondary p-6 rounded-xl shadow-lg text-white">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Attendance Rate</p>
          <h3 className="text-4xl font-black font-headline">{report.rate}%</h3>
          <div className="w-full bg-white/20 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-white h-full" style={{ width: `${report.rate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Chart & Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hourly Check-in Flow Gauge Chart */}
        <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl p-8 flex flex-col items-center justify-center text-center border-t-8 border-primary-fixed border border-surface-container">
          <h4 className="font-headline font-bold text-lg mb-6">Hourly Check-in Flow</h4>
          {(() => {
            const peakInterval = [...hourlyData].sort((a, b) => b.check_ins_count - a.check_ins_count)[0];
            const peakCount = peakInterval ? peakInterval.check_ins_count : 0;
            const peakTime = peakInterval ? peakInterval.hourly_interval : "—";
            const totalCheckIns = report.checked || 1;
            const percentage = Math.min(Math.round((peakCount / totalCheckIns) * 100), 100);
            
            const circumference = 552.92;
            const strokeDashoffset = circumference - (circumference * percentage) / 100;

            return (
              <>
                <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-high" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
                    <circle className="text-primary" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeWidth="12" strokeLinecap="round"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{peakCount}</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">Peak at {peakTime}</span>
                  </div>
                </div>
                <div className="w-full space-y-3 mt-4 text-left">
                  {hourlyData.slice(0, 4).map((item) => (
                    <div className="flex justify-between items-center text-xs border-b border-surface-container-low pb-2" key={item.hourly_interval}>
                      <span className="font-medium text-on-surface-variant">{item.hourly_interval}</span>
                      <span className="font-bold">{item.check_ins_count} checked</span>
                    </div>
                  ))}
                  {hourlyData.length === 0 && (
                    <div className="text-xs text-on-surface-variant text-center">No hourly check-ins recorded.</div>
                  )}
                </div>
              </>
            );
          })()}
        </div>

        {/* Attendance Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container">
          <div className="px-8 py-6 flex justify-between items-center bg-surface-container-low/50">
            <h4 className="font-headline font-bold text-lg">Attendee Tracking Log</h4>
            <Link to="/admin/participants" className="text-primary text-sm font-bold flex items-center gap-1">
              <span>View All</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-on-surface-variant text-sm">Loading attendance data...</div>
          ) : rows.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant text-sm">No registrations available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-surface-container">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Participant Name</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Reg ID</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Check-in Time</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {rows.slice(0, 5).map((row) => {
                    const isCheckedIn = row.attendance_status === "checked_in";
                    return (
                      <tr className="hover:bg-surface-container-high transition-colors" key={row.id}>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs">
                              {getInitials(row.participant_name)}
                            </div>
                            <span className="font-semibold text-sm">{row.participant_name || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-mono text-xs text-on-surface-variant">{row.ticket_code || "—"}</td>
                        <td className="px-6 py-5 text-sm">
                          {isCheckedIn && row.checked_in_at 
                            ? new Date(row.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : "—"}
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${
                            isCheckedIn 
                              ? "bg-green-100 text-green-700" 
                              : "bg-error-container text-on-error-container text-red-700"
                          }`}>
                            {isCheckedIn ? "Present" : "Absent"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-8 py-4 bg-surface-container-lowest border-t border-surface-container flex justify-between items-center">
            <span className="text-xs text-on-surface-variant">Showing {Math.min(rows.length, 5)} of {rows.length} entries</span>
            <div className="flex gap-2 opacity-50 cursor-not-allowed">
              <button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-high text-on-surface" disabled>
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white text-xs font-bold" disabled>1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-high text-on-surface" disabled>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant font-medium w-full">
        <p>© 2024 Eventra Management Systems. All rights reserved.</p>
        <div className="flex gap-6">
          <a className="hover:text-primary" href="#">Data Privacy Policy</a>
          <a className="hover:text-primary" href="#">Admin Guidelines</a>
          <a className="hover:text-primary" href="#">Support Desk</a>
        </div>
      </div>
    </AdminLayout>
  );
}
