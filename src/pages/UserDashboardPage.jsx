import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import { getUserRegistrations } from "../lib/eventService";
import { useAuth } from "../state/AuthContext";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getUserRegistrations(user.id)
      .then(setRows)
      .catch((e) => {
        setError(e.message || "Failed to load your registrations");
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const stats = useMemo(
    () => ({
      registered: rows.length,
      checkedIn: rows.filter((r) => r.attendance_status === "checked_in").length,
      pending: rows.filter((r) => r.attendance_status !== "checked_in").length
    }),
    [rows]
  );

  const nextEvent = useMemo(() => {
    if (rows.length === 0) return null;
    return [...rows]
      .sort((a, b) => new Date(a.event?.date || 0).getTime() - new Date(b.event?.date || 0).getTime())
      .find((row) => new Date(row.event?.date || 0).getTime() >= Date.now()) || rows[0];
  }, [rows]);

  return (
    <div className="bg-surface font-body text-on-surface">
      {/* TopNavBar Shared Component */}
      <PublicNav />
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header & Greeting Section */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-primary font-label label-md uppercase tracking-widest font-bold mb-2 block">Dashboard Overview</span>
              <h1 className="font-headline font-extrabold text-4xl lg:text-5xl tracking-tight text-on-surface mb-2">
                Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}
              </h1>
              <p className="text-on-surface-variant max-w-xl">Manage your event registrations, track attendance, and explore upcoming academic symposiums and cultural showcases.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/events" className="premium-gradient text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                <span className="material-symbols-outlined text-sm">explore</span>
                Explore Events
              </Link>
            </div>
          </div>
        </header>

        {error ? <div className="mb-6 bg-error-container text-on-error-container px-4 py-3 rounded-lg">{error}</div> : null}

        {/* Stats Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border-b-4 border-primary group hover:bg-surface-container-low transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary-fixed rounded-lg text-on-primary-fixed">
                <span className="material-symbols-outlined">how_to_reg</span>
              </div>
            </div>
            <div className="text-on-surface-variant font-label label-md uppercase tracking-widest mb-1">Total Registered</div>
            <div className="text-4xl font-headline font-black text-on-surface">{stats.registered}</div>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border-b-4 border-secondary group hover:bg-surface-container-low transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-secondary-fixed rounded-lg text-on-secondary-fixed">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
            </div>
            <div className="text-on-surface-variant font-label label-md uppercase tracking-widest mb-1">Upcoming</div>
            <div className="text-4xl font-headline font-black text-on-surface">{stats.pending}</div>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border-b-4 border-surface-container-highest group hover:bg-surface-container-low transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-surface-container-high rounded-lg text-on-surface-variant">
                <span className="material-symbols-outlined">verified</span>
              </div>
            </div>
            <div className="text-on-surface-variant font-label label-md uppercase tracking-widest mb-1">Attended</div>
            <div className="text-4xl font-headline font-black text-on-surface">{stats.checkedIn}</div>
          </div>
        </section>

        {/* Next Event Status Card */}
        {nextEvent ? (
          <div className="mb-12 p-6 bg-primary-fixed text-on-primary-fixed rounded-xl shadow-sm border border-primary-fixed-variant">
            <p className="text-xs uppercase tracking-widest font-bold text-on-primary-fixed-variant mb-1">Next Event</p>
            <h4 className="text-xl font-headline font-bold mb-1">{nextEvent.event?.title || "Upcoming event"}</h4>
            <p className="text-sm text-on-primary-fixed-variant font-medium">
              {nextEvent.event?.date ? new Date(nextEvent.event.date).toDateString() : "Date TBD"} • {nextEvent.event?.venue || "Venue TBD"}
            </p>
          </div>
        ) : null}

        {/* Registration List Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-headline headline-sm font-semibold text-2xl">My Registered Events</h2>
            <div className="flex items-center gap-4 text-sm font-medium text-on-surface-variant">
              <span className="text-primary underline decoration-2 underline-offset-4">All Registrations ({rows.length})</span>
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="bg-surface-container-lowest rounded-xl p-8 text-center text-on-surface-variant font-medium">
                Loading your registrations...
              </div>
            ) : rows.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-12 text-center shadow-sm">
                <h2 className="text-xl font-headline font-bold mb-2">No registrations yet</h2>
                <p className="text-on-surface-variant mb-6 font-body">Browse events and register to generate your first QR ticket.</p>
                <Link className="inline-flex premium-gradient text-white px-8 py-3 rounded-full font-semibold shadow-lg" to="/events">
                  Explore Events
                </Link>
              </div>
            ) : (
              rows.map((item) => {
                const isCheckedIn = item.attendance_status === "checked_in";
                const eventDate = item.event?.date ? new Date(item.event.date) : null;
                const formattedDate = eventDate
                  ? eventDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                  : "Date TBD";
                return (
                  <div key={item.id} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row hover:bg-white transition-all group">
                    <div className="md:w-64 h-48 md:h-auto overflow-hidden bg-surface-container">
                      {item.event?.image_url ? (
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={item.event.image_url}
                          alt={item.event.title || "Event banner"}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant bg-surface-container-high">
                          <span className="material-symbols-outlined text-4xl">image_not_supported</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {item.event?.category || "General"}
                          </span>
                          <span className="flex items-center gap-1 text-on-surface-variant text-sm font-medium">
                            <span className="material-symbols-outlined text-base">calendar_month</span>
                            {formattedDate}
                          </span>
                        </div>
                        <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">{item.event?.title || "Untitled Event"}</h3>
                        <div className="flex items-center gap-4 text-on-surface-variant text-sm">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">location_on</span>
                            {item.event?.venue || "Venue TBD"}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">confirmation_number</span>
                            Ticket: {item.ticket_code || "Pending"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-surface-container">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full bg-green-500 ${isCheckedIn ? "bg-green-500 shadow-[0_0_8px_rgba(0,255,0,0.4)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"}`}></span>
                          <span className="font-bold text-sm text-on-surface uppercase tracking-tight">
                            {isCheckedIn ? "Checked In" : "Pending Check-in"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Link
                            className="bg-surface-container-high text-on-surface font-bold px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-surface-container-highest transition-colors"
                            to={`/ticket/${item.id}`}
                          >
                            <span className="material-symbols-outlined text-lg">qr_code_2</span>
                            View QR
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* Side Decoration */}
      <div className="fixed top-1/2 -right-12 -translate-y-1/2 rotate-90 hidden lg:block pointer-events-none">
        <span className="text-surface-container font-headline font-black text-[120px] opacity-40 select-none">EVENTRA</span>
      </div>
    </div>
  );
}
