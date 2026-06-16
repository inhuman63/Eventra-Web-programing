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
    category: "Technology",
    sub_category: "",
    date: "",
    start_time: "",
    venue: "",
    capacity: 100,
    price: 0,
    description: "",
    image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop",
    is_active: true,
    registration_deadline: "",
    enable_waitlist: true,
    is_private: false
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
      await createEvent({
        ...form,
        capacity: Number(form.capacity),
        price: Number(form.price)
      });
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
    <AdminLayout
      title="Add New Event"
      subtitle="Create and curate a new experience for the Eventra community."
      actions={
        <div className="flex gap-3">
          <Link
            className="px-6 py-2.5 rounded-full font-semibold text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
            to="/admin/events"
          >
            Save as Draft
          </Link>
          <button
            type="submit"
            form="add-event-form"
            disabled={submitting}
            className="px-8 py-2.5 rounded-full font-semibold text-sm text-white bg-gradient-to-br from-primary to-primary-container shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50"
          >
            {submitting ? "Publishing..." : "Publish Event"}
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-6 bg-error-container text-on-error-container px-6 py-4 rounded-xl shadow-sm border border-error/20 flex items-center gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <form id="add-event-form" onSubmit={handleSubmit} className="max-w-6xl mx-auto w-full">
        {/* Form Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Primary Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Basic Info Section */}
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-symbols-outlined">info</span>
                <h2 className="text-lg font-bold">Basic Information</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Event Title</label>
                  <input
                    className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/40 placeholder:text-slate-400"
                    placeholder="e.g. International Design Symposium 2024"
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Category</label>
                    <select
                      className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/40"
                      value={form.category}
                      onChange={(e) => update("category", e.target.value)}
                    >
                      <option>Technology</option>
                      <option>Arts &amp; Culture</option>
                      <option>Business</option>
                      <option>Education</option>
                      <option>Networking</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Sub-Category</label>
                    <input
                      className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/40"
                      placeholder="UI/UX Design"
                      type="text"
                      value={form.sub_category}
                      onChange={(e) => update("sub_category", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/40"
                    placeholder="Describe the purpose and highlights of the event..."
                    rows={6}
                    required
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Date & Location Section */}
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-symbols-outlined">location_on</span>
                <h2 className="text-lg font-bold">Date &amp; Venue</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Start Date</label>
                  <input
                    className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/40"
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Start Time</label>
                  <input
                    className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/40"
                    type="time"
                    value={form.start_time}
                    onChange={(e) => update("start_time", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Venue Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400">map</span>
                  <input
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/40"
                    placeholder="Enter physical location or Online Link"
                    type="text"
                    required
                    value={form.venue}
                    onChange={(e) => update("venue", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Media */}
          <div className="lg:col-span-4 space-y-8">
            {/* Media Upload */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <span className="material-symbols-outlined">image</span>
                <h2 className="text-lg font-bold">Event Media</h2>
              </div>
              <div className="border-2 border-dashed border-outline-variant/30 rounded-xl p-6 text-center bg-surface-container-low hover:bg-surface-container-high transition-colors group relative">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2 group-hover:text-primary transition-colors">cloud_upload</span>
                <p className="text-sm font-semibold text-on-surface mb-2">Cover Image URL</p>
                <input
                  className="w-full px-3 py-2 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/40 text-xs placeholder:text-slate-400 text-center"
                  placeholder="Paste image URL here..."
                  type="text"
                  value={form.image_url}
                  onChange={(e) => update("image_url", e.target.value)}
                />
                <p className="text-xs text-on-surface-variant mt-2">Recommended: 1920x1080 (JPG/PNG)</p>
              </div>
              <div className="mt-4 rounded-lg overflow-hidden relative group">
                <img
                  className="w-full h-40 object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all"
                  alt="Preview"
                  src={form.image_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop"}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold text-xs">PREVIEW PLACEHOLDER</div>
              </div>
            </div>

            {/* Registration Settings */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-symbols-outlined">settings_account_box</span>
                <h2 className="text-lg font-bold">Registration</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Seat Limit</label>
                  <div className="flex items-center gap-3">
                    <input
                      className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/40"
                      type="number"
                      min="1"
                      required
                      value={form.capacity}
                      onChange={(e) => update("capacity", e.target.value)}
                    />
                    <span className="text-xs font-bold text-slate-400">SEATS</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Deadline Date</label>
                  <input
                    className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/40"
                    type="date"
                    value={form.registration_deadline}
                    onChange={(e) => update("registration_deadline", e.target.value)}
                  />
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface">Enable Waitlist</span>
                  <button
                    type="button"
                    onClick={() => update("enable_waitlist", !form.enable_waitlist)}
                    className={`w-10 h-6 rounded-full relative transition-colors ${form.enable_waitlist ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.enable_waitlist ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface">Private Event</span>
                  <button
                    type="button"
                    onClick={() => update("is_private", !form.is_private)}
                    className={`w-10 h-6 rounded-full relative transition-colors ${form.is_private ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.is_private ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Assistance Card */}
            <div className="bg-secondary-fixed rounded-xl p-6 text-on-secondary-fixed relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold mb-2">Need help?</h3>
                <p className="text-sm opacity-80 leading-relaxed">Our AI assistant can help optimize your event description for better engagement.</p>
                <button className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary hover:underline transition-all" type="button">
                  Try AI Writer <span className="material-symbols-outlined text-xs">auto_awesome</span>
                </button>
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12">psychology</span>
            </div>
          </div>
        </div>

        <footer className="mt-12 py-8 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center text-on-surface-variant gap-4">
          <div className="text-sm">
            © 2024 Eventra Management System. All rights reserved.
          </div>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
            <a className="hover:text-primary" href="#">Guidelines</a>
            <a className="hover:text-primary" href="#">Support</a>
            <a className="hover:text-primary" href="#">Privacy</a>
          </div>
        </footer>
      </form>
    </AdminLayout>
  );
}
