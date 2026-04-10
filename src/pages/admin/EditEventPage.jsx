import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { getEventById, updateEvent } from "../../lib/eventService";

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "Tech",
    date: "",
    venue: "",
    capacity: 100,
    price: 0,
    description: "",
    image_url: "",
    is_active: true
  });

  useEffect(() => {
    getEventById(id)
      .then((event) => {
        setForm({
          title: event.title || "",
          category: event.category || "Tech",
          date: event.date || "",
          venue: event.venue || "",
          capacity: event.capacity || 100,
          price: event.price || 0,
          description: event.description || "",
          image_url: event.image_url || "",
          is_active: event.is_active !== false
        });
      })
      .catch((e) => setError(e.message || "Failed to load event"))
      .finally(() => setLoading(false));
  }, [id]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (form.title.trim().length < 3) {
      setError("Event title must be at least 3 characters.");
      setSaving(false);
      return;
    }

    if (Number(form.capacity) < 1) {
      setError("Capacity must be at least 1.");
      setSaving(false);
      return;
    }

    try {
      await updateEvent(id, {
        ...form,
        capacity: Number(form.capacity),
        price: Number(form.price)
      });
      navigate("/admin/events", { state: { message: "Event updated successfully." } });
    } catch (err) {
      setError(err.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout subtitle="Update event details" title="Edit Event">
      {loading ? <div className="bg-white rounded-xl p-6">Loading event...</div> : null}
      {!loading ? (
        <form className="bg-white rounded-xl p-6 grid md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
          {error ? <div className="md:col-span-2 bg-error-container text-on-error-container px-4 py-3 rounded-lg">{error}</div> : null}
          <Field label="Title"><input className="w-full bg-surface-container-highest rounded-lg" onChange={(e) => updateField("title", e.target.value)} required value={form.title} /></Field>
          <Field label="Category"><select className="w-full bg-surface-container-highest rounded-lg" onChange={(e) => updateField("category", e.target.value)} value={form.category}><option>Tech</option><option>Music</option><option>Art</option><option>Sports</option></select></Field>
          <Field label="Date"><input className="w-full bg-surface-container-highest rounded-lg" onChange={(e) => updateField("date", e.target.value)} required type="date" value={form.date} /></Field>
          <Field label="Venue"><input className="w-full bg-surface-container-highest rounded-lg" onChange={(e) => updateField("venue", e.target.value)} required value={form.venue} /></Field>
          <Field label="Capacity"><input className="w-full bg-surface-container-highest rounded-lg" min="1" onChange={(e) => updateField("capacity", e.target.value)} required type="number" value={form.capacity} /></Field>
          <Field label="Price"><input className="w-full bg-surface-container-highest rounded-lg" min="0" onChange={(e) => updateField("price", e.target.value)} type="number" value={form.price} /></Field>
          <Field label="Image URL"><input className="w-full bg-surface-container-highest rounded-lg" onChange={(e) => updateField("image_url", e.target.value)} value={form.image_url} /></Field>
          <Field label="Status"><select className="w-full bg-surface-container-highest rounded-lg" onChange={(e) => updateField("is_active", e.target.value === "true")} value={String(form.is_active)}><option value="true">Active</option><option value="false">Inactive</option></select></Field>
          <div className="md:col-span-2">
            <Field label="Description"><textarea className="w-full bg-surface-container-highest rounded-lg" onChange={(e) => updateField("description", e.target.value)} required rows={5} value={form.description} /></Field>
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button className="premium-gradient text-white px-8 py-3 rounded-full font-semibold" disabled={saving} type="submit">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link className="bg-surface-container-low px-8 py-3 rounded-full font-semibold" to="/admin/events">
              Cancel
            </Link>
          </div>
        </form>
      ) : null}
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
