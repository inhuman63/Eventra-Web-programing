import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { createEvent } from "../../lib/eventService";

export default function AddEventPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "Tech",
    date: "",
    venue: "",
    capacity: 100,
    price: 0,
    description: "",
    image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop",
    is_active: true
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (form.title.trim().length < 3) {
      setError("Event title must be at least 3 characters.");
      setSubmitting(false);
      return;
    }

    if (!form.date) {
      setError("Please select an event date.");
      setSubmitting(false);
      return;
    }

    if (Number(form.capacity) < 1) {
      setError("Capacity must be at least 1.");
      setSubmitting(false);
      return;
    }

    try {
      await createEvent({ ...form, capacity: Number(form.capacity), price: Number(form.price) });
      navigate("/admin/events", { state: { message: "Event created successfully." } });
    } catch (err) {
      setError(err.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  }

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <AdminLayout subtitle="Create and publish a new event" title="Add Event">
      <form className="bg-white rounded-xl p-6 grid md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
        {error ? <div className="md:col-span-2 bg-error-container text-on-error-container px-4 py-3 rounded-lg">{error}</div> : null}
        <Field label="Title"><input className="w-full bg-surface-container-highest rounded-lg" onChange={(e) => update("title", e.target.value)} required value={form.title} /></Field>
        <Field label="Category"><select className="w-full bg-surface-container-highest rounded-lg" onChange={(e) => update("category", e.target.value)} value={form.category}><option>Tech</option><option>Music</option><option>Art</option><option>Sports</option></select></Field>
        <Field label="Date"><input className="w-full bg-surface-container-highest rounded-lg" onChange={(e) => update("date", e.target.value)} required type="date" value={form.date} /></Field>
        <Field label="Venue"><input className="w-full bg-surface-container-highest rounded-lg" onChange={(e) => update("venue", e.target.value)} required value={form.venue} /></Field>
        <Field label="Capacity"><input className="w-full bg-surface-container-highest rounded-lg" min="1" onChange={(e) => update("capacity", e.target.value)} required type="number" value={form.capacity} /></Field>
        <Field label="Price"><input className="w-full bg-surface-container-highest rounded-lg" min="0" onChange={(e) => update("price", e.target.value)} type="number" value={form.price} /></Field>
        <Field label="Image URL"><input className="w-full bg-surface-container-highest rounded-lg" onChange={(e) => update("image_url", e.target.value)} value={form.image_url} /></Field>
        <Field label="Status"><select className="w-full bg-surface-container-highest rounded-lg" onChange={(e) => update("is_active", e.target.value === "true")} value={String(form.is_active)}><option value="true">Active</option><option value="false">Inactive</option></select></Field>
        <div className="md:col-span-2">
          <Field label="Description"><textarea className="w-full bg-surface-container-highest rounded-lg" onChange={(e) => update("description", e.target.value)} required rows={5} value={form.description} /></Field>
        </div>
        <div className="md:col-span-2">
          <div className="flex flex-wrap gap-3">
            <button className="premium-gradient text-white px-8 py-3 rounded-full font-semibold" disabled={submitting} type="submit">{submitting ? "Publishing..." : "Publish Event"}</button>
            <Link className="bg-surface-container-low px-8 py-3 rounded-full font-semibold" to="/admin/events">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2">{label}</span>
      {children}
    </label>
  );
}
