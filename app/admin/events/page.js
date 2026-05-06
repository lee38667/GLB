"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    entrance: "",
    capacity: "",
    tags: "",
    status: "draft",
    featured: false,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/events");
      const data = await response.json();

      if (data.success) {
        setEvents(data.data);
      } else {
        setError(data.error || "Failed to fetch events");
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
    };

    try {
      const url = editingEvent ? `/api/events/${editingEvent._id}` : "/api/events";
      const method = editingEvent ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        fetchEvents();
        closeModal();
      } else {
        alert(data.error || "Failed to save event");
      }
    } catch (err) {
      console.error("Error saving event:", err);
      alert("Failed to save event");
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const data = await response.json();

      if (data.success) {
        fetchEvents();
      }
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time || "",
        location: event.location,
        entrance: event.entrance || "",
        capacity: event.capacity || "",
        tags: event.tags.join(", "),
        status: event.status,
        featured: event.featured,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        entrance: "",
        capacity: "",
        tags: "",
        status: "draft",
        featured: false,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "text-sand bg-white/5 border-white/10";
      case "draft":
        return "text-zinc-400 bg-black/20 border-white/10";
      case "cancelled":
        return "text-zinc-500 bg-black/25 border-white/10";
      case "completed":
        return "text-zinc-300 bg-white/5 border-white/10";
      default:
        return "text-clay/60 bg-white/5 border-white/10";
    }
  };

  return (
    <main className="w-full px-6 pb-24 pt-32 sm:px-10 sm:pt-36">
      <motion.header
        className="mb-10 flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-tide/80">
            Admin Dashboard
          </span>
          <h1 className="mt-4 font-display text-4xl tracking-tight text-sand sm:text-5xl">
            Event Management
          </h1>
        </div>
        <button
          onClick={() => openModal()}
          className="rounded-full bg-gradient-to-r from-white via-zinc-300 to-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-ink shadow-[0_18px_32px_rgba(255,255,255,0.18)] transition hover:shadow-[0_22px_42px_rgba(255,255,255,0.26)]"
        >
          + Create Event
        </button>
      </motion.header>

      {/* Event List */}
      <motion.section
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-flare border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center text-zinc-300">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center text-clay/60">
            No events found. Create your first event!
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event._id}
              className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-2xl text-sand">{event.title}</h3>
                      {event.featured && (
                        <span className="mt-2 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-sand">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <span
                      className={`rounded-full border px-4 py-1 text-[0.6rem] uppercase tracking-[0.35em] ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-clay/75">{event.description}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-clay/60">
                    <span>📅 {event.date}</span>
                    {event.time && <span>⏰ {event.time}</span>}
                    <span>📍 {event.location}</span>
                    {event.entrance && <span>🎫 N$ {event.entrance}</span>}
                    {event.capacity && <span>👥 Max: {event.capacity}</span>}
                    {event.rsvpCount > 0 && <span>✓ {event.rsvpCount} RSVPs</span>}
                  </div>

                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-full border border-white/10 px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-sand/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 lg:flex-col">
                  <button
                    onClick={() => openModal(event)}
                    className="flex-1 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sand/80 transition hover:border-white/30 lg:flex-none"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteEvent(event._id)}
                    className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-300 transition hover:bg-white/10 lg:flex-none"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </motion.section>

      {/* Event Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          <motion.div
            className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-charcoal via-ash to-charcoal shadow-2xl"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-h-[90vh] overflow-y-auto p-8 sm:p-10">
              <div className="flex items-start justify-between">
                <h2 className="font-display text-3xl text-sand">
                  {editingEvent ? "Edit Event" : "Create Event"}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full p-2 text-sand/60 transition hover:bg-white/10 hover:text-sand"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-clay/60 sm:col-span-2">
                    Title *
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-sand placeholder:text-clay/50 focus:border-flare/60 focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-clay/60 sm:col-span-2">
                    Description *
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-sand placeholder:text-clay/50 focus:border-flare/60 focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-clay/60">
                    Date *
                    <input
                      type="text"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      placeholder="14 November"
                      className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-sand placeholder:text-clay/50 focus:border-flare/60 focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-clay/60">
                    Time
                    <input
                      type="text"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      placeholder="5–10pm"
                      className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-sand placeholder:text-clay/50 focus:border-flare/60 focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-clay/60">
                    Location *
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Open-Air Venue"
                      className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-sand placeholder:text-clay/50 focus:border-flare/60 focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-clay/60">
                    Entrance Fee
                    <input
                      type="text"
                      value={formData.entrance}
                      onChange={(e) => setFormData({ ...formData, entrance: e.target.value })}
                      placeholder="50"
                      className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-sand placeholder:text-clay/50 focus:border-flare/60 focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-clay/60">
                    Capacity
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="100"
                      className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-sand placeholder:text-clay/50 focus:border-flare/60 focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-clay/60">
                    Status *
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-sand focus:border-flare/60 focus:outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-clay/60 sm:col-span-2">
                    Tags (comma-separated)
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="Exhibition, Open Air, Curated"
                      className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-sand placeholder:text-clay/50 focus:border-flare/60 focus:outline-none"
                    />
                  </label>

                  <label className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-clay/60">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="h-5 w-5 rounded border-white/10 bg-black/30 text-flare focus:ring-flare/60"
                    />
                    Featured Event
                  </label>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full border border-white/10 px-7 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-sand/80 transition hover:border-white/40"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-gradient-to-r from-white via-zinc-300 to-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-ink shadow-[0_18px_32px_rgba(255,255,255,0.18)] transition hover:shadow-[0_22px_42px_rgba(255,255,255,0.26)]"
                  >
                    {editingEvent ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
