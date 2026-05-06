"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const events = [
  {
    title: "Street Cache Volume 1",
    date: "Nov 14",
    location: "Open-Air Venue",
    detail: "A curated open-air brand exhibition blending fashion showcases, stalls, and social connection.",
  },
];

export default function EventsPreview() {
  return (
    <section className="mx-auto max-w-6xl px-6 sm:px-10">
      <div className="rounded-[36px] border border-white/10 bg-gradient-to-br from-black/60 via-charcoal/70 to-black/40 p-10 backdrop-blur">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.17, 0.67, 0.36, 0.99] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-flare/80">
              Upcoming Event
            </span>
            <h2 className="mt-4 max-w-lg font-display text-4xl tracking-tight text-sand">
              Experience the drop in motion.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-clay/80">
              Join us for Street Cache Volume 1 -- an open-air exhibition featuring brand showcases, stalls, and space to connect with the community.
            </p>
            <Link
              href="/events"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-7 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-sand transition hover:border-white/40"
            >
              View Event Details
            </Link>
          </motion.div>

          <ul className="grid flex-1 gap-6">
            {events.map((event, index) => (
              <motion.li
                key={event.title}
                className="rounded-3xl border border-white/10 bg-black/40 p-6 text-sm text-clay/80 backdrop-blur"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5, ease: [0.17, 0.67, 0.36, 0.99] }}
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-pulse/80">
                  <span>{event.date}</span>
                  <span>{event.location}</span>
                </div>
                <h3 className="mt-4 font-display text-xl text-sand">{event.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-clay/70">{event.detail}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
