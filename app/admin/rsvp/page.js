"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AdminRsvpDashboard() {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, cancelled
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRsvps();
  }, []);

  const fetchRsvps = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/rsvp");
      const data = await response.json();

      if (data.success) {
        setRsvps(data.data);
      } else {
        setError(data.error || "Failed to fetch RSVPs");
      }
    } catch (err) {
      console.error("Error fetching RSVPs:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateRsvpStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/rsvp/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setRsvps((prev) =>
          prev.map((rsvp) =>
            rsvp._id === id ? { ...rsvp, status: newStatus } : rsvp
          )
        );
      }
    } catch (err) {
      console.error("Error updating RSVP:", err);
    }
  };

  const deleteRsvp = async (id) => {
    if (!confirm("Are you sure you want to delete this RSVP?")) return;

    try {
      const response = await fetch(`/api/rsvp/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setRsvps((prev) => prev.filter((rsvp) => rsvp._id !== id));
      }
    } catch (err) {
      console.error("Error deleting RSVP:", err);
    }
  };

  const filteredRsvps = rsvps
    .filter((rsvp) => {
      if (filter === "all") return true;
      return rsvp.status === filter;
    })
    .filter((rsvp) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        rsvp.name.toLowerCase().includes(search) ||
        rsvp.email.toLowerCase().includes(search) ||
        rsvp.eventTitle.toLowerCase().includes(search)
      );
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-sand bg-white/5 border-white/10";
      case "pending":
        return "text-zinc-400 bg-black/20 border-white/10";
      case "cancelled":
        return "text-zinc-500 bg-black/25 border-white/10";
      default:
        return "text-clay/60 bg-white/5 border-white/10";
    }
  };

  const stats = {
    total: rsvps.length,
    pending: rsvps.filter((r) => r.status === "pending").length,
    confirmed: rsvps.filter((r) => r.status === "confirmed").length,
    cancelled: rsvps.filter((r) => r.status === "cancelled").length,
    totalGuests: rsvps.reduce((sum, r) => sum + (r.guests || 1), 0),
  };

  return (
    <main className="w-full px-6 pb-24 pt-32 sm:px-10 sm:pt-36">
      <motion.header
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-tide/80">
              Admin Dashboard
            </span>
            <h1 className="mt-4 font-display text-4xl tracking-tight text-sand sm:text-5xl">
              RSVP Management
            </h1>
          </div>
          <button
            onClick={fetchRsvps}
            className="rounded-full border border-white/10 bg-black/40 p-3 text-sand transition hover:border-white/30 hover:bg-white/10"
            aria-label="Refresh"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </motion.header>

      {/* Stats */}
      <motion.section
        className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        {[
          { label: "Total RSVPs", value: stats.total, color: "sand" },
          { label: "Pending", value: stats.pending, colorClass: "text-zinc-400" },
          { label: "Confirmed", value: stats.confirmed, colorClass: "text-sand" },
          { label: "Cancelled", value: stats.cancelled, colorClass: "text-zinc-500" },
          { label: "Total Guests", value: stats.totalGuests, colorClass: "text-zinc-300" },
        ].map((stat, index) => (
          <div
            key={index}
            className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className={`text-3xl font-display ${stat.colorClass}`}>
              {stat.value}
            </div>
            <div className="mt-2 text-xs uppercase tracking-[0.35em] text-clay/60">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.section>

      {/* Filters & Search */}
      <motion.section
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex gap-2">
          {["all", "pending", "confirmed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${filter === status
                  ? "bg-gradient-to-r from-white via-zinc-300 to-white text-ink shadow-[0_12px_22px_rgba(255,255,255,0.18)]"
                  : "border border-white/10 text-sand/80 hover:border-white/30"
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by name, email, or event..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-full border border-white/10 bg-black/30 px-5 py-2 text-sm text-sand placeholder:text-clay/50 focus:border-flare/60 focus:outline-none"
        />
      </motion.section>

      {/* RSVP List */}
      <motion.section
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-flare border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center text-zinc-300">
            {error}
          </div>
        ) : filteredRsvps.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center text-clay/60">
            No RSVPs found
          </div>
        ) : (
          filteredRsvps.map((rsvp) => (
            <div
              key={rsvp._id}
              className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-xl text-sand">{rsvp.name}</h3>
                      <p className="mt-1 text-sm text-clay/75">{rsvp.email}</p>
                      {rsvp.phone && (
                        <p className="mt-1 text-sm text-clay/60">{rsvp.phone}</p>
                      )}
                    </div>
                    <span
                      className={`rounded-full border px-4 py-1 text-[0.6rem] uppercase tracking-[0.35em] ${getStatusColor(
                        rsvp.status
                      )}`}
                    >
                      {rsvp.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-clay/60">
                    <span>📅 {rsvp.eventTitle}</span>
                    <span>🗓️ {rsvp.eventDate}</span>
                    <span>👥 {rsvp.guests} {rsvp.guests === 1 ? "guest" : "guests"}</span>
                    {rsvp.createdAt && (
                      <span>
                        ⏰ {new Date(rsvp.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {rsvp.message && (
                    <div className="rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-clay/75">
                      <span className="text-xs uppercase tracking-[0.3em] text-clay/60">
                        Message:
                      </span>
                      <p className="mt-2">{rsvp.message}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 lg:flex-col">
                  <button
                    onClick={() => updateRsvpStatus(rsvp._id, "confirmed")}
                    disabled={rsvp.status === "confirmed"}
                    className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sand transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed lg:flex-none"
                  >
                    ✓ Confirm
                  </button>
                  <button
                    onClick={() => updateRsvpStatus(rsvp._id, "pending")}
                    disabled={rsvp.status === "pending"}
                    className="flex-1 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-300 transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed lg:flex-none"
                  >
                    ⏸ Pending
                  </button>
                  <button
                    onClick={() => updateRsvpStatus(rsvp._id, "cancelled")}
                    disabled={rsvp.status === "cancelled"}
                    className="flex-1 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed lg:flex-none"
                  >
                    ✕ Cancel
                  </button>
                  <button
                    onClick={() => deleteRsvp(rsvp._id)}
                    className="flex-1 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-clay/60 transition hover:border-white/30 hover:bg-white/10 hover:text-sand lg:flex-none"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </motion.section>
    </main>
  );
}
