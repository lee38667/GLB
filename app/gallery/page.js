"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function GalleryPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/gallery/events", { cache: "no-store" })
      .then((r) => r.json())
      .then((p) => {
        if (!mounted) return;
        if (p?.success) setEvents(p?.data?.events || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const totalCount = useMemo(
    () => events.reduce((s, e) => s + (e.images?.length || 0), 0),
    [events],
  );

  return (
    <main className="bg-paper text-ink">
      {/* HERO */}
      <section className="glb-hero">
        <div className="glb-shell">
          <div className="flex items-center justify-between border-b border-ink pb-4">
            <span className="glb-caption uppercase tracking-[0.22em]">
              Letter № 05 · Archive
            </span>
            <span className="glb-eyebrow-stamp">Contact Sheet</span>
          </div>

          <div className="grid grid-cols-12 gap-8 mt-12 items-end">
            <div className="col-span-12 lg:col-span-8 anim-rise">
              <p className="glb-num">Frames pulled from the archive</p>
              <h1 className="glb-display mt-5 text-[clamp(2.6rem,8vw,7rem)]">
                Proof, in <em>frames.</em>
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 anim-rise delay-2">
              <p className="glb-lede">
                A visual library from GLB events, showcases, and quiet
                community moments. Photographed by friends, edited at home,
                printed for the room.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="brand-chip">{events.length} events</span>
                <span className="brand-chip">{totalCount} frames</span>
                <Link
                  href="https://instagram.com/glb.cache"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-vermillion underline-offset-4 hover:underline"
                >
                  Instagram →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EVENT BLOCKS — contact-sheet style */}
      <section className="glb-section pt-0">
        <div className="glb-shell space-y-20">
          {events.length === 0 && (
            <div className="border-t border-b border-ink py-20 text-center">
              <p className="glb-num mb-4">Empty archive</p>
              <p className="font-display text-2xl italic">
                No frames yet — check back after the next gathering.
              </p>
            </div>
          )}

          {events.map((event, idx) => (
            <article key={event.slug}>
              <header className="grid grid-cols-12 gap-4 items-end border-b border-ink pb-5">
                <div className="col-span-12 sm:col-span-8">
                  <p className="font-mono text-vermillion text-[0.66rem] tracking-[0.22em] uppercase">
                    Plate № {String(idx + 1).padStart(2, "0")}
                  </p>
                  <h2 className="glb-display mt-3 text-[clamp(1.8rem,4.5vw,3.6rem)]">
                    {event.name}
                  </h2>
                </div>
                <div className="col-span-12 sm:col-span-4 sm:text-right">
                  <span className="brand-chip">{event.images.length} frames</span>
                </div>
              </header>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {event.images.map((img, i) => (
                  <figure
                    key={`${event.slug}-${img.url}-${i}`}
                    className="relative bg-paper-warm border border-ink overflow-hidden group"
                    style={{
                      transform:
                        i % 5 === 0
                          ? "rotate(-0.6deg)"
                          : i % 5 === 2
                          ? "rotate(0.6deg)"
                          : "rotate(0)",
                    }}
                  >
                    <span className="absolute top-2 left-2 z-10 font-mono text-[0.58rem] tracking-[0.18em] text-paper-warm bg-ink px-1.5 py-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={img.url}
                        alt={img.title || `${event.name} frame ${i + 1}`}
                        fill
                        sizes="(min-width:1024px) 22vw, (min-width:640px) 33vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </figure>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SIGNUP */}
      <section className="glb-signup">
        <div className="glb-shell">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
            <div>
              <p className="font-mono text-vermillion text-[0.66rem] tracking-[0.22em] uppercase">
                P.S.
              </p>
              <h2 className="font-display mt-4 text-[clamp(2rem,4vw,3.6rem)] leading-[0.95] tracking-tight">
                Want to <em className="italic text-vermillion font-light">photograph</em> the next one?
              </h2>
            </div>
            <Link href="/contact" className="glb-btn glb-btn-stamp">
              Pitch us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
