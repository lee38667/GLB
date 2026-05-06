"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AdminEmailPage() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    eventTitle: "",
    subject: "",
    message: "",
    recipientFilter: "all", // all, confirmed, pending
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events?status=published");
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setResult(null);

    try {
      const response = await fetch("/api/email/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setResult({ type: "success", message: data.message });
        setFormData({
          eventTitle: "",
          subject: "",
          message: "",
          recipientFilter: "all",
        });
      } else {
        setResult({ type: "error", message: data.error || "Failed to send email" });
      }
    } catch (err) {
      console.error("Email error:", err);
      setResult({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="w-full px-6 pb-24 pt-32 sm:px-10 sm:pt-36">
      <motion.header
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-tide/80">
          Admin Dashboard
        </span>
        <h1 className="mt-4 font-display text-4xl tracking-tight text-sand sm:text-5xl">
          Send Bulk Email
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-clay/75">
          Send event updates or announcements to RSVP attendees.
        </p>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="space-y-6">
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-clay/60">
                Event (Optional)
                <select
                  value={formData.eventTitle}
                  onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-sand focus:border-flare/60 focus:outline-none"
                >
                  <option value="">All Events</option>
                  {events.map((event) => (
                    <option key={event._id} value={event.title}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-clay/60">
                Recipient Filter
                <select
                  value={formData.recipientFilter}
                  onChange={(e) => setFormData({ ...formData, recipientFilter: e.target.value })}
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-sand focus:border-flare/60 focus:outline-none"
                >
                  <option value="all">All RSVPs</option>
                  <option value="confirmed">Confirmed Only</option>
                  <option value="pending">Pending Only</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-clay/60">
                Subject *
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Event Update: Street Cache Volume 1"
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-sand placeholder:text-clay/50 focus:border-flare/60 focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-clay/60">
                Message *
                <textarea
                  required
                  rows={10}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your message here... (supports HTML)"
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-sand placeholder:text-clay/50 focus:border-flare/60 focus:outline-none"
                />
              </label>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-300">
                💡 <strong>Tip:</strong> You can use HTML in the message field for rich formatting.
                Recipients will be added as BCC to protect their privacy.
              </div>
            </div>
          </div>

          {result && (
            <div
              className={`rounded-2xl border px-5 py-3 text-sm ${result.type === "success"
                  ? "border-white/15 bg-white/5 text-zinc-200"
                  : "border-white/15 bg-black/30 text-zinc-300"
                }`}
            >
              {result.message}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  eventTitle: "",
                  subject: "",
                  message: "",
                  recipientFilter: "all",
                });
                setResult(null);
              }}
              className="rounded-full border border-white/10 px-7 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-sand/80 transition hover:border-white/40"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-white via-zinc-300 to-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-ink shadow-[0_18px_32px_rgba(255,255,255,0.18)] transition hover:shadow-[0_22px_42px_rgba(255,255,255,0.26)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "📧 Send Email"}
            </button>
          </div>
        </form>
      </motion.section>
    </main>
  );
}
