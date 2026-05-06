"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import RsvpModal from "../../src/components/RsvpModal";

const EVENT = {
  title: "Street Cache",
  edition: "Volume 01",
  date: "14 November",
  time: "17:00 – 22:00",
  entrance: "N$60",
  location: "Open-Air Venue, Windhoek",
  description:
    "An open-air evening where brands, creatives, and community gather around product, music, and shared momentum. A late-summer programme.",
  tags: ["Open Air", "Limited Entry", "Live Showcases", "Vendors & Tea"],
};

const FLOW = [
  ["17:00", "17:30", "Arrival · social warmup"],
  ["17:30", "18:00", "Opening remarks · introductions"],
  ["18:00", "20:00", "Stalls · networking · product discovery"],
  ["20:00", "21:00", "Live brand showcases"],
  ["21:00", "22:00", "Closing sales · community sendoff"],
];

const NOTES = [
  "Fashion and food vendors run parallel lanes.",
  "MC transitions keep momentum and schedule discipline.",
  "Capacity is limited to keep the experience close.",
  "RSVPs are processed through our events backend.",
];

export default function EventsPage() {
  const [rsvpModal, setRsvpModal] = useState({ isOpen: false, event: null });

  return (
    <main className="bg-paper text-ink">
      <RsvpModal
        isOpen={rsvpModal.isOpen}
        onClose={() => setRsvpModal({ isOpen: false, event: null })}
        event={rsvpModal.event}
      />

      {/* HERO — playbill */}
      <section className="glb-hero">
        <div className="glb-shell">
          <div className="flex items-center justify-between border-b border-ink pb-4">
            <span className="glb-caption uppercase tracking-[0.22em]">
              Programme · Letter № 04
            </span>
            <span className="glb-eyebrow-stamp">Open Air</span>
          </div>

          <div className="grid grid-cols-12 gap-8 mt-12 items-end">
            <div className="col-span-12 lg:col-span-8 anim-rise">
              <p className="glb-num">{EVENT.edition} · {EVENT.date}</p>
              <h1 className="glb-display mt-5 text-[clamp(2.6rem,9vw,8rem)]">
                Street <em>Cache,</em>
                <br />
                under sky.
              </h1>
              <p className="glb-lede mt-6">{EVENT.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {EVENT.tags.map((t) => (
                  <span key={t} className="brand-chip">{t}</span>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3 anim-rise delay-2">
                <button
                  type="button"
                  onClick={() => setRsvpModal({ isOpen: true, event: EVENT })}
                  className="glb-btn glb-btn-stamp"
                >
                  RSVP for the night
                </button>
                <a
                  href="/assets/glb-catalog.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glb-btn glb-btn-ghost"
                >
                  View catalogue
                </a>
              </div>
            </div>

            {/* ticket stub */}
            <aside className="col-span-12 lg:col-span-4 anim-rise delay-3">
              <div
                className="border border-ink bg-paper-warm relative"
                style={{ boxShadow: "8px 8px 0 0 var(--ink)" }}
              >
                <div className="p-6">
                  <p className="font-mono text-[0.6rem] tracking-[0.22em] uppercase text-vermillion">
                    Admit one
                  </p>
                  <p className="glb-display mt-2 text-3xl tracking-tight">
                    {EVENT.title}
                  </p>
                  <p className="glb-caption mt-1">{EVENT.edition}</p>
                </div>
                <div className="glb-perforated" style={{ background: "var(--paper-warm)" }} />
                <dl className="p-6 grid grid-cols-2 gap-y-4 gap-x-3 text-sm">
                  <div>
                    <dt className="font-mono text-[0.58rem] tracking-[0.22em] uppercase text-graphite">Date</dt>
                    <dd className="mt-1 font-display text-lg">{EVENT.date}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.58rem] tracking-[0.22em] uppercase text-graphite">Doors</dt>
                    <dd className="mt-1 font-display text-lg">{EVENT.time}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.58rem] tracking-[0.22em] uppercase text-graphite">Entry</dt>
                    <dd className="mt-1 font-display text-lg text-vermillion italic">{EVENT.entrance}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.58rem] tracking-[0.22em] uppercase text-graphite">Where</dt>
                    <dd className="mt-1 font-display text-lg">Windhoek</dd>
                  </div>
                </dl>
                <span
                  aria-hidden
                  className="absolute -top-7 -right-7 anim-stamp delay-4"
                >
                  <span className="glb-stamp">
                    Stamped
                    <br />
                    · MMXXVI ·
                  </span>
                </span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* PROGRAMME */}
      <section className="glb-section pt-0">
        <div className="glb-shell">
          <div className="grid grid-cols-12 gap-6 sm:gap-10 items-start">
            <div className="col-span-12 lg:col-span-4">
              <p className="glb-num">№ 09 — Programme</p>
              <h2 className="glb-display mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)]">
                A night, <em>in five movements.</em>
              </h2>
              <p className="glb-lede mt-4">
                Time-stamped, lightly choreographed, and held together by an
                MC who knows how to move a room.
              </p>
            </div>

            <ol className="col-span-12 lg:col-span-8 list-none p-0 m-0 border-t border-ink">
              {FLOW.map(([from, to, label], i) => (
                <li
                  key={`${from}-${i}`}
                  className="grid grid-cols-[5rem_1fr_4rem] sm:grid-cols-[6rem_1fr_5rem] gap-4 py-5 border-b border-hairline items-baseline"
                >
                  <span className="font-mono text-vermillion text-sm tracking-[0.16em]">
                    {from}
                  </span>
                  <span className="font-display text-xl sm:text-2xl tracking-tight leading-snug">
                    {label}
                  </span>
                  <span className="font-mono text-graphite text-xs text-right tracking-[0.16em]">
                    →{to}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* OPERATOR NOTES */}
      <section className="glb-manifesto">
        <div className="glb-manifesto-margin" />
        <div className="glb-shell">
          <p className="glb-num">№ 10 — Operator notes</p>
          <h2 className="glb-display mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)]">
            How the <em>night</em> runs.
          </h2>
          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
            {NOTES.map((n, i) => (
              <li
                key={n}
                className="border-t border-ink pt-3 flex gap-4 items-start"
              >
                <span className="font-mono text-vermillion text-xs tracking-[0.22em] shrink-0">
                  0{i + 1}.
                </span>
                <p className="font-display text-xl tracking-tight leading-snug">
                  {n}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SECONDARY CTA */}
      <section className="glb-section">
        <div className="glb-shell">
          <div className="grid grid-cols-12 gap-6 items-end">
            <figure className="col-span-12 sm:col-span-7 relative aspect-[5/4] border border-ink overflow-hidden">
              <Image
                src="/assets/IMG_8569.jpg"
                alt="Past Street Cache"
                fill
                className="object-cover"
                sizes="(min-width:768px) 58vw, 100vw"
              />
              <figcaption className="absolute bottom-3 left-3 right-3 flex justify-between glb-caption text-paper-warm bg-ink/85 px-3 py-2">
                <span>Plate 03 — Cache, prior edition</span>
                <span>2025</span>
              </figcaption>
            </figure>
            <div className="col-span-12 sm:col-span-5">
              <p className="glb-num">P.S.</p>
              <p className="glb-display text-[clamp(1.6rem,2.6vw,2.4rem)] mt-3 leading-tight">
                Come <em>early.</em> Bring a friend. Wear something you love.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setRsvpModal({ isOpen: true, event: EVENT })}
                  className="glb-btn glb-btn-ink"
                >
                  RSVP now
                </button>
                <Link href="/gallery" className="glb-btn glb-btn-ghost">
                  Past nights
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
