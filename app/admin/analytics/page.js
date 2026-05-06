"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [rsvpRes, eventsRes] = await Promise.all([
          fetch("/api/rsvp"),
          fetch("/api/events"),
        ]);

        const rsvpData = await rsvpRes.json();
        const eventsData = await eventsRes.json();

        if (!rsvpData.success || !eventsData.success) {
          throw new Error("Failed to load analytics data");
        }

        const rsvps = rsvpData.data;
        const events = eventsData.data;

        const stats = {
          totalRsvps: rsvps.length,
          totalEvents: events.length,
          publishedEvents: events.filter((event) => event.status === "published").length,
          upcomingEvents: events.filter((event) => event.status === "published" || event.status === "draft").length,
          totalGuests: rsvps.reduce((sum, rsvp) => sum + (rsvp.guests || 1), 0),
          confirmedRsvps: rsvps.filter((rsvp) => rsvp.status === "confirmed").length,
          pendingRsvps: rsvps.filter((rsvp) => rsvp.status === "pending").length,
          cancelledRsvps: rsvps.filter((rsvp) => rsvp.status === "cancelled").length,
          avgGuestsPerRsvp: rsvps.length > 0
            ? (rsvps.reduce((sum, rsvp) => sum + (rsvp.guests || 1), 0) / rsvps.length).toFixed(1)
            : 0,
        };

        const eventBreakdown = events.map((event) => {
          const eventRsvps = rsvps.filter((rsvp) => rsvp.eventTitle === event.title);
          return {
            title: event.title,
            rsvpCount: eventRsvps.length,
            guestCount: eventRsvps.reduce((sum, rsvp) => sum + (rsvp.guests || 1), 0),
            status: event.status,
          };
        });

        const recentRsvps = [...rsvps]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);

        setAnalytics({ stats, eventBreakdown, recentRsvps });
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Unable to load analytics right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const exportToCSV = () => {
    if (!analytics) return;

    const headers = ["Name", "Email", "Phone", "Event", "Date", "Guests", "Status", "Submitted"];
    const rows = analytics.recentRsvps.map((rsvp) => [
      rsvp.name,
      rsvp.email,
      rsvp.phone || "",
      rsvp.eventTitle,
      rsvp.eventDate,
      rsvp.guests,
      rsvp.status,
      new Date(rsvp.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rsvp-export-${new Date().toISOString().split("T")[0]}.csv`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <main className="flex h-screen w-full items-center justify-center px-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-flare border-t-transparent" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex h-screen w-full items-center justify-center px-6">
        <div className="max-w-md rounded-[28px] border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <p className="text-sm text-zinc-300">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full border border-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-sand transition hover:border-white/30 hover:bg-white/10"
          >
            Refresh
          </button>
        </div>
      </main>
    );
  }

  const statsCards = [
    { label: "Total RSVPs", value: analytics.stats.totalRsvps, valueClass: "text-sand", icon: "📝" },
    { label: "Total Guests", value: analytics.stats.totalGuests, valueClass: "text-zinc-200", icon: "👥" },
    { label: "Published Events", value: analytics.stats.publishedEvents, valueClass: "text-zinc-400", icon: "📅" },
    { label: "Avg Guests/RSVP", value: analytics.stats.avgGuestsPerRsvp, valueClass: "text-zinc-500", icon: "📊" },
  ];

  const statusCards = [
    { label: "Confirmed", value: analytics.stats.confirmedRsvps, className: "border-white/10 bg-white/5 text-sand" },
    { label: "Pending", value: analytics.stats.pendingRsvps, className: "border-white/10 bg-black/20 text-zinc-300" },
    { label: "Cancelled", value: analytics.stats.cancelledRsvps, className: "border-white/10 bg-black/25 text-zinc-500" },
  ];

  return (
    <main className="w-full px-6 pb-24 pt-32 sm:px-10 sm:pt-36">
      <motion.header
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-zinc-400">
              Admin Dashboard
            </span>
            <h1 className="mt-4 font-display text-4xl tracking-tight text-sand sm:text-5xl">
              Analytics
            </h1>
          </div>
          <button
            type="button"
            onClick={exportToCSV}
            className="rounded-full border border-white/10 bg-black/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-sand transition hover:border-white/30 hover:bg-white/10"
          >
            📊 Export CSV
          </button>
        </div>
      </motion.header>

      <motion.section
        className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        {statsCards.map((stat) => (
          <div key={stat.label} className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className={`text-4xl font-display ${stat.valueClass}`}>{stat.value}</div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
            <div className="mt-3 text-xs uppercase tracking-[0.35em] text-clay/60">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.section>

      <motion.section
        className="mb-10 grid gap-6 sm:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {statusCards.map((stat) => (
          <div key={stat.label} className={`rounded-[28px] border p-6 backdrop-blur ${stat.className}`}>
            <div className="text-3xl font-display text-sand">{stat.value}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.35em] text-zinc-400">
              {stat.label} RSVPs
            </div>
          </div>
        ))}
      </motion.section>

      <motion.section
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h2 className="mb-6 font-display text-2xl text-sand">Event Performance</h2>
        <div className="space-y-4">
          {analytics.eventBreakdown.map((event) => (
            <div key={event.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl text-sand">{event.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-clay/60">
                    <span>📝 {event.rsvpCount} RSVPs</span>
                    <span>👥 {event.guestCount} Guests</span>
                    <span className="capitalize text-zinc-400">{event.status}</span>
                  </div>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl font-display text-sand">
                  {event.rsvpCount}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h2 className="mb-6 font-display text-2xl text-sand">Recent RSVPs</h2>
        <div className="space-y-3">
          {analytics.recentRsvps.map((rsvp) => (
            <div key={rsvp._id} className="flex items-center justify-between rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-sand">
                  {rsvp.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-sand">{rsvp.name}</div>
                  <div className="text-xs text-clay/60">
                    {rsvp.eventTitle} • {rsvp.guests} {rsvp.guests === 1 ? "guest" : "guests"}
                  </div>
                </div>
              </div>
              <div className="text-xs text-clay/60">{new Date(rsvp.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </motion.section>
    </main>
  );
}
