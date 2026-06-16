import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import { getEventById, registerForEvent } from "../lib/eventService";
import { useAuth } from "../state/AuthContext";
import { supabase } from "../lib/supabase";

export default function EventDetailsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    async function loadDetails() {
      try {
        const data = await getEventById(id);
        if (!isActive) return;
        setEvent(data);
      } catch (e) {
        if (!isActive) return;
        setError(e.message || "Event not found");
        setEvent(null);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadDetails();

    // Load registrations count
    supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", id)
      .then(({ count }) => {
        if (isActive) setRegistrationsCount(count || 0);
      })
      .catch((e) => console.error("Error fetching registrations count:", e));

    if (user) {
      setCheckingRegistration(true);
      supabase
        .from("registrations")
        .select("id, attendance_status")
        .eq("event_id", id)
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (isActive) setRegistration(data);
        })
        .catch((e) => console.error("Error checking registration:", e))
        .finally(() => {
          if (isActive) setCheckingRegistration(false);
        });
    } else {
      setRegistration(null);
      setCheckingRegistration(false);
    }

    return () => {
      isActive = false;
    };
  }, [id, user]);

  async function handleRegister() {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setRegistering(true);
      setError("");
      const reg = await registerForEvent(id, user);
      navigate(`/ticket/${reg.id}`);
    } catch (e) {
      setError(e.message || "Failed to register");
    } finally {
      setRegistering(false);
    }
  }

  if (loading || checkingRegistration) return <div className="p-8">Loading event details...</div>;
  if (!event) {
    return (
      <div className="p-8">
        Event not found. <Link className="text-primary font-semibold" to="/events">Return to listing</Link>
      </div>
    );
  }

  const spotsLeft = Math.max(0, event.capacity - registrationsCount);
  const capacityPercent = event.capacity > 0 ? Math.min(100, (registrationsCount / event.capacity) * 100) : 0;
  const eventDateStr = event.date
    ? new Date(event.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : "Date TBD";

  return (
    <div className="bg-background font-body text-on-surface">
      {/* Top Navigation Shared Component */}
      <PublicNav />
      <main className="max-w-7xl mx-auto pb-24">
        {/* Hero Section */}
        <section className="relative h-[614px] w-full overflow-hidden mb-12">
          <div className="absolute inset-0 hero-mask">
            {event.image_url ? (
              <img alt="Event Banner" className="w-full h-full object-cover" src={event.image_url} />
            ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-[100px]">image</span>
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label text-[0.75rem] uppercase tracking-widest font-bold mb-4">
              {event.category || "General"}
            </div>
            <h1 className="font-headline font-extrabold text-5xl md:text-7xl tracking-tight text-on-surface mb-6 max-w-4xl">
              {event.title}
            </h1>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold">
                {event.category?.substring(0, 2).toUpperCase() || "EV"}
              </div>
              <div>
                <p className="font-label text-on-surface-variant text-[0.75rem] uppercase tracking-widest font-bold">Organized by</p>
                <p className="font-headline font-semibold text-on-surface">Eventra Curator</p>
              </div>
            </div>
          </div>
        </section>

        {/* Page Content: Asymmetric Layout */}
        <div className="px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Primary Information */}
          <div className="lg:col-span-8 space-y-16">
            {/* Description */}
            <article>
              <h2 className="font-headline headline-sm font-semibold mb-6 text-primary">About the Event</h2>
              <div className="space-y-4 text-on-surface-variant text-lg leading-relaxed font-body max-w-3xl whitespace-pre-line">
                {event.description || "No description available yet."}
              </div>
            </article>

            {/* Agenda (Bento Style) */}
            <section>
              <h2 className="font-headline headline-sm font-semibold mb-8 text-primary">Conference Agenda</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-primary">
                  <span className="font-label text-primary font-bold text-[0.75rem]">09:00 AM - 10:30 AM</span>
                  <h3 className="font-headline font-bold text-xl mt-1">Opening Keynote: Session 1</h3>
                  <p className="text-on-surface-variant text-sm mt-2">Welcome remarks and intro</p>
                </div>
                <div className="p-6 bg-surface-container-low rounded-xl">
                  <span className="font-label text-on-surface-variant font-bold text-[0.75rem]">11:00 AM - 12:30 PM</span>
                  <h3 className="font-headline font-bold text-xl mt-1">Breakout: Deep Dive Discussion</h3>
                  <p className="text-on-surface-variant text-sm mt-2">Interactive panel discussion</p>
                </div>
                <div className="p-6 bg-surface-container-low rounded-xl">
                  <span className="font-label text-on-surface-variant font-bold text-[0.75rem]">01:30 PM - 03:00 PM</span>
                  <h3 className="font-headline font-bold text-xl mt-1">Ethical Frameworks & Q&A</h3>
                  <p className="text-on-surface-variant text-sm mt-2">Q&A session with attendees</p>
                </div>
                <div className="p-6 bg-surface-container-low rounded-xl">
                  <span className="font-label text-on-surface-variant font-bold text-[0.75rem]">04:00 PM - 06:00 PM</span>
                  <h3 className="font-headline font-bold text-xl mt-1">Networking Showcase</h3>
                  <p className="text-on-surface-variant text-sm mt-2">Main Exhibition Pavilion</p>
                </div>
              </div>
            </section>

            {/* Map */}
            <section>
              <h2 className="font-headline headline-sm font-semibold mb-6 text-primary">Venue Location</h2>
              <div className="w-full h-80 bg-surface-container-highest rounded-xl overflow-hidden relative">
                <img alt="Map" className="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJw3T3ZCt7hPhnjcboCnc80gqEhyfDkhzRtU4nProTDfKyjqOxIGkHB-XeFy0DK13Vvy7HfxiD0pHn9yj4S-5naXJ2OaouOnftr0qa1U-KvZZkrVhLpkNdNtJexLv-XEqq9qlRxUYDW4zyIJwFv63pgSFOT0_wuJAZvcxiRLxYSxuo3pcol0PNpiT7iL_To4C4HDU0vLtFudqHXTbjMg8fSulfvwqfXGIXM2_f0Ottp4sBWIsbo3cPOZ81CnERDFHEBg8kRAJmbBQ" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-4 bg-white rounded-full shadow-2xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    </div>
                    <div className="pr-4">
                      <p className="font-headline font-bold text-sm">{event.venue}</p>
                      <p className="text-xs text-on-surface-variant">Event Location</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Contextual Event Card */}
          <aside className="lg:col-span-4 sticky top-28">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden p-8 space-y-8 bg-white border border-slate-100">
              {/* Event Details List */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-surface-container-low rounded-lg text-primary">
                    <span className="material-symbols-outlined">calendar_today</span>
                  </div>
                  <div>
                    <p className="font-label text-[0.7rem] uppercase tracking-widest text-on-surface-variant font-bold">Date</p>
                    <p className="font-headline font-bold text-lg">{eventDateStr}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-surface-container-low rounded-lg text-primary">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <p className="font-label text-[0.7rem] uppercase tracking-widest text-on-surface-variant font-bold">Time</p>
                    <p className="font-headline font-bold text-lg">{event.start_time || "09:00 AM - 06:00 PM"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-surface-container-low rounded-lg text-primary">
                    <span className="material-symbols-outlined">map</span>
                  </div>
                  <div>
                    <p className="font-label text-[0.7rem] uppercase tracking-widest text-on-surface-variant font-bold">Venue</p>
                    <p className="font-headline font-bold text-lg">{event.venue}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-surface-container-low rounded-lg text-primary">
                    <span className="material-symbols-outlined">event_seat</span>
                  </div>
                  <div>
                    <p className="font-label text-[0.7rem] uppercase tracking-widest text-on-surface-variant font-bold">Availability</p>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: `${capacityPercent}%` }}></div>
                      </div>
                      <p className="font-headline font-bold text-sm">{spotsLeft}/{event.capacity} left</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="pt-6 border-t border-surface-container-high space-y-4">
                {error ? <p className="text-error text-sm text-center mb-2">{error}</p> : null}

                {!registration ? (
                  <button
                    onClick={handleRegister}
                    disabled={registering || spotsLeft === 0}
                    className="w-full py-4 rounded-full editorial-gradient text-white font-headline font-bold text-lg shadow-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    type="button"
                  >
                    <span>{registering ? "Registering..." : spotsLeft === 0 ? "Event Full" : "Register & Get QR"}</span>
                    <span className="material-symbols-outlined text-xl" data-icon="arrow_forward">arrow_forward</span>
                  </button>
                ) : (
                  <div className="p-6 bg-surface-container-low rounded-xl flex flex-col items-center text-center space-y-4">
                    <div className="flex items-center gap-2 text-green-700 font-bold text-sm px-4 py-1.5 bg-green-50 rounded-full">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Registered
                    </div>
                    <p className="text-xs text-on-surface-variant">You have successfully secured a seat for this event.</p>
                    
                    <Link
                      to={`/ticket/${registration.id}`}
                      className="block p-4 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container-high group hover:scale-[1.02] transition-transform text-center bg-white"
                    >
                      <div className="w-32 h-32 bg-slate-100 rounded-lg mb-3 flex items-center justify-center mx-auto">
                        <span className="material-symbols-outlined text-6xl text-slate-300">qr_code_2</span>
                      </div>
                      <span className="text-primary font-headline font-bold text-sm flex items-center justify-center gap-2">
                        View My QR
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Invite Friends Widget */}
            <div className="mt-6 p-6 bg-primary-fixed rounded-xl flex items-center justify-between">
              <div>
                <p className="font-headline font-bold text-on-primary-fixed">Invite your team</p>
                <p className="text-xs text-on-primary-fixed-variant">Get a group discount</p>
              </div>
              <span className="material-symbols-outlined text-on-primary-fixed">share</span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
