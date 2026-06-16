import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { getUserRegistrations } from "../lib/eventService";
import { encodeTicketPayload } from "../lib/qrPayload";
import { useAuth } from "../state/AuthContext";

export default function QrTicketPage() {
  const { registrationId } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    if (!user) {
      setLoading(false);
      return;
    }
    getUserRegistrations(user.id)
      .then((rows) => {
        if (!isActive) return;
        setTicket(rows.find((r) => r.id === registrationId) || null);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [registrationId, user]);

  if (loading) return <div className="p-8">Loading ticket...</div>;
  if (!ticket) return <div className="p-8">Ticket not found. <Link className="text-primary font-semibold" to="/dashboard">Return to dashboard</Link></div>;

  const qrPayload = encodeTicketPayload({
    registrationId: ticket.id,
    eventId: ticket.event_id,
    userId: ticket.user_id,
    ticketCode: ticket.ticket_code,
    iat: Date.now()
  });

  const eventDate = ticket.event?.date ? new Date(ticket.event.date) : null;
  const formattedDate = eventDate
    ? eventDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "Date TBD";
  const formattedTime = ticket.event?.start_time || "09:00 AM";

  const passTypeLabel = ticket.ticket_type === "vip" 
    ? "VIP All-Access" 
    : ticket.ticket_type === "early_bird" 
      ? "Early Bird Pass" 
      : "Standard Pass";

  return (
    <div className="bg-background font-body text-on-background antialiased min-h-screen">
      {/* TopNavBar - Simple branding for focused transactional flow */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <Link className="font-headline text-2xl font-black tracking-tighter text-blue-700" to="/dashboard">Eventra</Link>
        <div className="flex items-center gap-4">
          <Link className="text-on-surface-variant hover:bg-surface-container-high transition-colors p-2 rounded-full flex items-center" to="/dashboard">
            <span className="material-symbols-outlined">close</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center pt-32 pb-12 px-4">
        {/* Success Animation/Icon Cluster */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm mb-6">
            <div className="w-16 h-16 rounded-full premium-gradient flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">Registration Successful!</h1>
          <p className="text-on-surface-variant body-md max-w-md mx-auto">Your place has been reserved for the event. We've sent a confirmation email with all details to your inbox.</p>
        </div>

        {/* The Ticket Card */}
        <div className="relative w-full max-w-md ticket-cutout">
          <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] flex flex-col bg-white border border-slate-100">
            {/* Ticket Top Section */}
            <div className="p-8 pb-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="font-label text-[10px] uppercase tracking-widest font-bold text-primary mb-1 block">Event Confirmation</span>
                  <h2 className="font-headline text-2xl font-bold text-on-surface leading-tight">{ticket.event?.title || "Your Event Ticket"}</h2>
                </div>
                <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-6">
                <div className="col-span-2">
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">Participant Name</span>
                  <p className="font-semibold text-on-surface">{ticket.participant_name || "Unknown"}</p>
                </div>
                <div>
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">Registration ID</span>
                  <p className="font-semibold text-on-surface">{ticket.ticket_code}</p>
                </div>
                <div>
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">Pass Type</span>
                  <p className="font-semibold text-primary">{passTypeLabel}</p>
                </div>
                <div>
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">Date & Time</span>
                  <p className="text-on-surface body-md">{formattedDate} • {formattedTime}</p>
                </div>
                <div>
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">Venue</span>
                  <p className="text-on-surface body-md">{ticket.event?.venue || "Venue TBD"}</p>
                </div>
              </div>
            </div>
            {/* Perforation Line */}
            <div className="px-8 relative">
              <div className="dash-line opacity-30"></div>
            </div>
            {/* QR Section */}
            <div className="p-8 pt-10 text-center bg-surface-container-low/30 border-t border-dashed border-slate-200">
              {/* QR Code Container as a "Physical Object" */}
              <div className="inline-block p-6 bg-white rounded-2xl shadow-sm mb-6 border border-slate-100">
                <QRCodeSVG size={192} value={qrPayload} />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span className="font-label text-[11px] uppercase tracking-wider font-bold">Important Note</span>
                </div>
                <p className="body-md text-on-surface-variant italic">Scan at the event for check-in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button className="flex-1 flex items-center justify-center gap-3 premium-gradient text-white py-4 px-6 rounded-full font-semibold hover:opacity-90 transition-all active:scale-95" onClick={() => window.print()} type="button">
            <span className="material-symbols-outlined animate-bounce">download</span>
            Download Ticket
          </button>
          <button className="flex-1 flex items-center justify-center gap-3 bg-surface-container-highest text-on-surface py-4 px-6 rounded-full font-semibold hover:bg-surface-variant transition-all active:scale-95 bg-slate-100" onClick={() => window.print()} type="button">
            <span className="material-symbols-outlined">print</span>
            Print
          </button>
        </div>

        {/* Secondary Information / Help */}
        <div className="mt-12 text-center">
          <p className="text-on-surface-variant body-md">Need assistance or have questions?</p>
          <a className="text-primary font-semibold hover:underline decoration-2 underline-offset-4" href="#">Contact Support Team</a>
        </div>
      </main>

      {/* Background Decoration */}
      <div className="fixed top-0 right-0 -z-10 opacity-10 pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full premium-gradient blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
      </div>
      <div className="fixed bottom-0 left-0 -z-10 opacity-5 pointer-events-none">
        <div className="w-[400px] h-[400px] rounded-full bg-secondary blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
      </div>
    </div>
  );
}
