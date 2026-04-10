import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import PublicNav from "../components/PublicNav";
import { getUserRegistrations } from "../lib/eventService";
import { encodeTicketPayload } from "../lib/qrPayload";
import { useAuth } from "../state/AuthContext";

export default function QrTicketPage() {
  const { registrationId } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserRegistrations(user.id)
      .then((rows) => {
        setTicket(rows.find((r) => r.id === registrationId) || null);
      })
      .finally(() => setLoading(false));
  }, [registrationId, user]);

  if (loading) return <div className="p-8">Loading ticket...</div>;
  if (!ticket) return <div className="p-8">Ticket not found.</div>;

  const qrPayload = encodeTicketPayload({
    registrationId: ticket.id,
    eventId: ticket.event_id,
    userId: ticket.user_id,
    ticketCode: ticket.ticket_code,
    iat: Date.now()
  });

  return (
    <div>
      <PublicNav />
      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="bg-white rounded-2xl p-8 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)]">
          <p className="text-xs uppercase tracking-widest font-bold text-primary mb-2">Registration Confirmed</p>
          <h1 className="text-3xl font-bold mb-1">{ticket.event?.title || "Your Event Ticket"}</h1>
          <p className="text-on-surface-variant mb-2">{ticket.event?.date ? new Date(ticket.event.date).toDateString() : "Date TBD"} • {ticket.event?.venue || "Venue TBD"}</p>
          <span className={`inline-block text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-bold mb-8 ${ticket.attendance_status === "checked_in" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {ticket.attendance_status === "checked_in" ? "Already Checked In" : "Pending Check-in"}
          </span>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-surface-container-low rounded-xl p-6 flex justify-center">
              <QRCodeSVG size={220} value={qrPayload} />
            </div>
            <div>
              <p className="uppercase tracking-widest text-xs text-on-surface-variant font-bold">Ticket Code</p>
              <p className="text-2xl font-headline font-black tracking-wider mb-4">{ticket.ticket_code}</p>
              <p className="text-sm text-on-surface-variant mb-5">Show this QR code at the entry scanner. Keep this page open for quick access.</p>
              <button className="premium-gradient text-white px-6 py-3 rounded-full font-semibold" onClick={() => window.print()} type="button">
                Print Ticket
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
