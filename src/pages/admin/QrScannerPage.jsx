import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import AdminLayout from "../../components/AdminLayout";
import { markAttendance } from "../../lib/eventService";
import { decodeTicketPayload } from "../../lib/qrPayload";
import { useAuth } from "../../state/AuthContext";

export default function QrScannerPage() {
  const { user } = useAuth();
  const scannerRef = useRef(null);
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("idle");
  const [checking, setChecking] = useState(false);

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

    return () => {
      scanner.clear().catch(() => undefined);
    };
  }, []);

  async function onDecoded(decodedText) {
    setChecking(true);
    try {
      const payload = decodeTicketPayload(decodedText);
      if (!payload?.ticketCode) {
        setStatus("Invalid QR payload");
        setStatusType("error");
        return;
      }

      const updated = await markAttendance(payload.ticketCode, user?.id || null);
      if (!updated) {
        setStatus("Ticket not found");
        setStatusType("error");
        setResult("");
        return;
      }
      setResult(updated.ticket_code);
      setStatus("Check-in successful");
      setStatusType("success");
    } catch {
      setStatus("Invalid QR payload");
      setStatusType("error");
    } finally {
      setChecking(false);
    }
  }

  async function handleManualSubmit(e) {
    e.preventDefault();
    setChecking(true);
    const formData = new FormData(e.currentTarget);
    const ticketCode = formData.get("ticketCode");
    try {
      const updated = await markAttendance(String(ticketCode), user?.id || null);
      if (!updated) {
        setStatus("Ticket not found");
        setStatusType("error");
        setResult("");
        return;
      }

      setResult(updated.ticket_code);
      setStatus("Check-in successful");
      setStatusType("success");
      e.currentTarget.reset();
    } catch (error) {
      setStatus(error.message || "Failed to verify ticket");
      setStatusType("error");
      setResult("");
    } finally {
      setChecking(false);
    }
  }

  return (
    <AdminLayout subtitle="Live scanner for attendance check-in" title="QR Attendance Scanner">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6">
          <h2 className="font-bold text-xl mb-4">Camera Scanner</h2>
          <div id="eventra-scanner" ref={scannerRef}></div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-bold mb-3">Manual Ticket Check-in</h3>
            <p className="text-sm text-on-surface-variant mb-3">Paste ticket code for fallback when camera scanning is unavailable.</p>
            <form className="flex gap-3" onSubmit={handleManualSubmit}>
              <input className="flex-1 bg-surface-container-high rounded-lg" name="ticketCode" placeholder="EVT-123456" required />
              <button className="premium-gradient text-white px-5 rounded-lg" disabled={checking} type="submit">{checking ? "Checking..." : "Check In"}</button>
            </form>
          </div>
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-bold mb-3">Last Result</h3>
            <p className={`font-semibold ${statusType === "success" ? "text-green-700" : statusType === "error" ? "text-error" : "text-on-surface-variant"}`}>
              Status: {status || "Waiting for scan"}
            </p>
            <p className="text-xl font-bold mt-2">{result || "-"}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
