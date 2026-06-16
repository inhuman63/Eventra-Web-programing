import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import AdminLayout from "../../components/AdminLayout";
import { markAttendance, logScanAttempt, getScannerStats } from "../../lib/eventService";
import { decodeTicketPayload } from "../../lib/qrPayload";
import { useAuth } from "../../state/AuthContext";

export default function QrScannerPage() {
  const { user } = useAuth();
  const scannerRef = useRef(null);
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("idle");
  const [checking, setChecking] = useState(false);
  const [lastAttendee, setLastAttendee] = useState(null);
  const [stats, setStats] = useState({
    totalCheckedIn: 0,
    vipCheckedIn: 0,
    activeScanners: 1,
    avgScanTime: 0.5,
    recentHistory: []
  });

  const refreshStats = () => {
    getScannerStats()
      .then(setStats)
      .catch((e) => console.error("Failed to load scanner stats:", e));
  };

  useEffect(() => {
    if (!scannerRef.current) return;

    const scanner = new Html5QrcodeScanner("eventra-scanner", { fps: 10, qrbox: 240 }, false);

    scanner.render(
      async (decodedText) => {
        await onDecoded(decodedText);
      },
      () => {
        // Ignore scan frame errors.
      }
    );

    refreshStats();

    return () => {
      scanner.clear().catch(() => undefined);
    };
  }, []);

  async function onDecoded(decodedText) {
    setChecking(true);
    setStatus("");
    const startTime = Date.now();
    try {
      const payload = decodeTicketPayload(decodedText);
      if (!payload?.ticketCode) {
        setStatus("Invalid QR payload");
        setStatusType("error");
        await logScanAttempt(user?.id || null, "INVALID", "invalid_ticket", Date.now() - startTime);
        refreshStats();
        return;
      }

      const updated = await markAttendance(payload.ticketCode, user?.id || null);
      if (!updated) {
        setStatus("Ticket not found");
        setStatusType("error");
        setResult("");
        await logScanAttempt(user?.id || null, payload.ticketCode, "invalid_ticket", Date.now() - startTime);
        refreshStats();
        return;
      }
      setResult(updated.ticket_code);
      setStatus("Check-in successful");
      setStatusType("success");
      setLastAttendee(updated);
      await logScanAttempt(user?.id || null, payload.ticketCode, "success", Date.now() - startTime);
      refreshStats();
    } catch {
      setStatus("Invalid QR payload");
      setStatusType("error");
      await logScanAttempt(user?.id || null, "ERROR", "error", Date.now() - startTime);
      refreshStats();
    } finally {
      setChecking(false);
    }
  }

  async function handleManualSubmit(e) {
    e.preventDefault();
    setChecking(true);
    setStatus("");
    const startTime = Date.now();
    const formData = new FormData(e.currentTarget);
    const ticketCode = formData.get("ticketCode");
    try {
      const updated = await markAttendance(String(ticketCode), user?.id || null);
      if (!updated) {
        setStatus("Ticket not found");
        setStatusType("error");
        setResult("");
        await logScanAttempt(user?.id || null, String(ticketCode), "invalid_ticket", Date.now() - startTime);
        refreshStats();
        return;
      }

      setResult(updated.ticket_code);
      setStatus("Check-in successful");
      setStatusType("success");
      setLastAttendee(updated);
      await logScanAttempt(user?.id || null, String(ticketCode), "success", Date.now() - startTime);
      refreshStats();
      e.currentTarget.reset();
    } catch (error) {
      setStatus(error.message || "Failed to verify ticket");
      setStatusType("error");
      setResult("");
      await logScanAttempt(user?.id || null, String(ticketCode), "error", Date.now() - startTime);
      refreshStats();
    } finally {
      setChecking(false);
    }
  }

  return (
    <AdminLayout
      title="QR Attendance Scanner"
      subtitle="Real-time check-in and validation for your attendees."
      actions={
        <div className="flex items-center gap-3 bg-surface-container-lowest p-2 rounded-xl shadow-sm border border-surface-container">
          <span className="text-xs font-bold text-primary uppercase tracking-widest font-label">Active Event:</span>
          <div className="relative">
            <select
              className="appearance-none bg-surface-container-high border-none rounded-lg px-4 pr-10 py-1.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-not-allowed opacity-50"
              disabled
            >
              <option>Global Tech Summit 2024</option>
              <option>Design Masters Workshop</option>
              <option>AI Innovation Expo</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              expand_more
            </span>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Scanner UI */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="relative bg-surface-dim rounded-xl overflow-hidden border-4 border-surface-container-lowest shadow-lg min-h-[340px] flex flex-col items-center justify-center p-4">
            <div id="eventra-scanner" ref={scannerRef} className="w-full"></div>
            
            {/* Live Camera Stream Badge Overlay */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm pointer-events-none z-10">
              <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-900 font-label">
                Live Camera Stream
              </span>
            </div>
          </div>

          {/* Controls/Instructions */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col items-center text-center gap-2 border border-surface-container transition-all hover:bg-surface-container-high cursor-not-allowed opacity-50">
              <span className="material-symbols-outlined text-primary">flashlight_on</span>
              <span className="text-xs font-semibold">Toggle Flash</span>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col items-center text-center gap-2 border border-surface-container transition-all hover:bg-surface-container-high cursor-not-allowed opacity-50">
              <span className="material-symbols-outlined text-primary">flip_camera_ios</span>
              <span className="text-xs font-semibold">Switch Lens</span>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col items-center text-center gap-2 border border-surface-container transition-all hover:bg-surface-container-high cursor-not-allowed opacity-50">
              <span className="material-symbols-outlined text-primary">keyboard</span>
              <span className="text-xs font-semibold">Manual Code</span>
            </div>
          </div>

          {/* Manual Ticket Check-in Form */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container">
            <h3 className="font-bold text-base mb-1">Manual Ticket Check-in</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Paste ticket code for fallback when camera scanning is unavailable.
            </p>
            <form className="flex gap-3" onSubmit={handleManualSubmit}>
              <input
                className="flex-1 bg-surface-container-high border-none rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/40"
                name="ticketCode"
                placeholder="e.g. EVT-123456"
                required
              />
              <button
                className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-md hover:shadow-primary/10 transition-all active:scale-95"
                disabled={checking}
                type="submit"
              >
                {checking ? "Checking..." : "Check In"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side Panel: Scan Results */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Dynamic Result Card */}
          {statusType === "success" && lastAttendee ? (
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm relative overflow-hidden border border-surface-container border-l-4 border-l-primary">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xl">
                    {lastAttendee.participant_name ? lastAttendee.participant_name.slice(0, 2).toUpperCase() : "—"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{lastAttendee.participant_name || "Unknown"}</h3>
                    <p className="text-xs text-slate-500 font-mono">ID: {lastAttendee.id?.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Attendance Marked
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm py-2 border-b border-surface-container-low">
                  <span className="text-slate-500">Ticket Type</span>
                  <span className="font-semibold text-primary">Standard</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-surface-container-low">
                  <span className="text-slate-500">Ticket Code</span>
                  <span className="font-semibold text-mono">{lastAttendee.ticket_code}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-surface-container-low">
                  <span className="text-slate-500">Check-in Time</span>
                  <span className="font-semibold">
                    {lastAttendee.checked_in_at
                      ? new Date(lastAttendee.checked_in_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "—"}
                  </span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <p className="text-xs font-medium text-green-800">Verified participant. Proceed to seating.</p>
              </div>
            </div>
          ) : statusType === "error" ? (
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container border-l-4 border-l-error">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400">person_off</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Unknown Attendee</h3>
                    <p className="text-xs text-slate-500">ID: Unknown</p>
                  </div>
                </div>
                <span className="bg-error-container text-on-error-container text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Invalid QR
                </span>
              </div>
              <div className="p-4 bg-error-container/30 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                  error
                </span>
                <p className="text-xs font-medium text-on-error-container">
                  {status || "The scanned code does not match any registered participant."}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container border-l-4 border-l-slate-300">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 font-bold">qr_code_scanner</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Waiting for scan</h3>
                    <p className="text-xs text-slate-500">Stream ready</p>
                  </div>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Ready
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg flex items-center gap-3 border border-surface-container">
                <span className="material-symbols-outlined text-slate-500">info</span>
                <p className="text-xs font-medium text-slate-600">
                  Scan a ticket QR code or enter it manually to check in.
                </p>
              </div>
            </div>
          )}

          {/* Scan History Log */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-label">
              Recent History
            </h4>
            {stats.recentHistory.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic">No scan history available in this session.</p>
            ) : (
              <div className="space-y-4">
                {stats.recentHistory.map((item) => (
                  <div className="flex items-center justify-between" key={item.id}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.success ? "bg-green-100" : "bg-error-container"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined ${item.success ? "text-green-600" : "text-error"} text-sm`}
                        >
                          {item.success ? "person" : "warning"}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-on-surface">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Stats Area */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
        <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl text-center border border-surface-container">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest font-label mb-1">
            Total Checked-in
          </p>
          <p className="text-3xl font-black text-primary">{stats.totalCheckedIn}</p>
          <p className="text-[10px] text-slate-400 mt-1">Total count</p>
        </div>
        <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl text-center border border-surface-container">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest font-label mb-1">VIP Present</p>
          <p className="text-3xl font-black text-secondary">{stats.vipCheckedIn}</p>
          <p className="text-[10px] text-slate-400 mt-1">VIP ticket check-ins</p>
        </div>
        <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl text-center border border-surface-container">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest font-label mb-1">Active Scanners</p>
          <p className="text-3xl font-black text-slate-900">{stats.activeScanners}</p>
          <p className="text-[10px] text-slate-400 mt-1">Active Terminals</p>
        </div>
        <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl text-center border border-surface-container">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest font-label mb-1">Avg Scan Time</p>
          <p className="text-3xl font-black text-slate-900">{stats.avgScanTime}s</p>
          <p className="text-[10px] text-slate-400 mt-1">Audit stream speed</p>
        </div>
      </div>
    </AdminLayout>
  );
}
