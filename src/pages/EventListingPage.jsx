import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import { listEvents } from "../lib/eventService";
import { seedEvents } from "../lib/demoData";

export default function EventListingPage() {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDemoFallback, setShowDemoFallback] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Upcoming");

  useEffect(() => {
    listEvents()
      .then((rows) => {
        if (!rows || rows.length === 0) {
          setEvents(seedEvents);
          setShowDemoFallback(true);
          return;
        }
        setEvents(rows);
        setShowDemoFallback(false);
      })
      .catch((e) => {
        setError(e.message || "Failed to load events");
        setEvents(seedEvents);
        setShowDemoFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => (e.title || "").toLowerCase().includes(query.toLowerCase()));
  }, [events, query]);

  const filterOptions = ["Upcoming", "Workshops", "Seminars", "Competitions"];

  return (
    <div className="bg-surface">
      <PublicNav />
      <main>
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-12">
            <span className="font-label label-md uppercase tracking-widest font-bold text-primary mb-4 block">DISCOVER EXPERIENCE</span>
            <h1 className="text-5xl lg:text-6xl font-headline font-extrabold tracking-tight text-on-surface mb-6">
              Explore Events
            </h1>
            
            <div className="relative mb-8">
              <input
                type="text"
                placeholder="Search by event name, venue or category..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-6 py-3 rounded-full bg-surface-container-high border border-outline-variant text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-all"
              />
              <span className="material-symbols-outlined absolute right-4 top-3 text-on-surface-variant">search</span>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-3 items-center">
              <button className="bg-primary text-white px-6 py-2 rounded-full font-semibold text-sm">
                Upcoming
              </button>
              {["Workshops", "Seminars", "Competitions"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                    activeFilter === filter
                      ? "bg-primary text-white"
                      : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {filter}
                </button>
              ))}
              <button className="p-2 hover:bg-surface-container rounded-lg transition-all">
                <span className="material-symbols-outlined">tune</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-error-container text-on-error-container px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {showDemoFallback && (
            <div className="mb-6 bg-primary-fixed text-on-primary-fixed px-4 py-3 rounded-lg text-sm">
              Showing demo events for demonstration purposes.
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-on-surface-variant">Loading events...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface-container-low rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">event_busy</span>
              <h2 className="text-2xl font-bold mb-2">No matching events found</h2>
              <p className="text-on-surface-variant mb-6">Try adjusting your search or filters to discover more events.</p>
              <button
                onClick={() => setQuery("")}
                className="bg-primary text-white px-6 py-2 rounded-full font-semibold"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filtered.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden hover:translate-y-[-8px] transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  <div className="aspect-video relative overflow-hidden bg-surface-container">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant">image_not_supported</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-error">
                      {event.available_seats > 10 ? `${event.available_seats} SEATS LEFT` : "5 SEATS LEFT"}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-secondary-fixed text-on-secondary-fixed text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                        {event.category || "General"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-4">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      {event.date ? new Date(event.date).toLocaleDateString() : "Date TBD"}
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-6">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {event.venue || "Location TBD"}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-surface-container">
                      <span className="font-semibold text-primary">Register Now</span>
                      <span className="material-symbols-outlined text-primary">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-on-surface-variant mb-6">Showing {filtered.length} of {events.length} events</p>
              <button className="bg-surface-container-lowest border-2 border-surface-container px-8 py-3 rounded-full font-semibold hover:bg-surface-container transition-all">
                Load More Events
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
