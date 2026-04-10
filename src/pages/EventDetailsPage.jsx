import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import { getEventById, registerForEvent } from "../lib/eventService";
import { useAuth } from "../state/AuthContext";

export default function EventDetailsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getEventById(id)
      .then(setEvent)
      .catch((e) => {
        setError(e.message || "Event not found");
        setEvent(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleRegister() {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setRegistering(true);
      setError("");
      const registration = await registerForEvent(id, user);
      navigate(`/ticket/${registration.id}`);
    } catch (e) {
      setError(e.message || "Failed to register");
    } finally {
      setRegistering(false);
    }
  }

  if (loading) return <div className="p-8">Loading event details...</div>;
  if (!event) return <div className="p-8">Event not found. <Link className="text-primary font-semibold" to="/events">Return to listing</Link></div>;

  return (
    <div>
      <PublicNav />
      <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <img alt={event.title || "Event image"} className="w-full rounded-2xl aspect-[16/7] object-cover mb-8" src={event.image_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop"} />
          <h1 className="text-4xl font-bold mb-4">{event.title || "Untitled Event"}</h1>
          <p className="text-on-surface-variant text-lg mb-6">{event.description || "No description available yet."}</p>
          <p className="text-sm uppercase tracking-wider text-on-surface-variant">
            {event.date ? new Date(event.date).toDateString() : "Date TBD"} • {event.venue || "Venue TBD"}
          </p>
        </div>
        <aside className="bg-surface-container-lowest rounded-xl p-6 h-fit shadow-sm">
          <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-3">Registration</p>
          <p className="text-3xl font-bold mb-3">{event.price ? `$${event.price}` : "Free"}</p>
          <p className="text-sm text-on-surface-variant mb-2">Capacity: {event.capacity || "N/A"} attendees</p>
          <p className="text-xs text-on-surface-variant mb-6">If the event is full, registration will be prevented automatically.</p>
          <button className="w-full premium-gradient text-white py-3 rounded-full font-semibold" disabled={registering} onClick={handleRegister} type="button">
            {registering ? "Registering..." : "Register & Get QR"}
          </button>
          {error ? <p className="text-error text-sm mt-4">{error}</p> : null}
          <Link className="block text-center text-primary font-semibold mt-4" to="/events">
            Back to events
          </Link>
        </aside>
      </section>
    </div>
  );
}
