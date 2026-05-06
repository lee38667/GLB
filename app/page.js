"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PRODUCTS } from "../src/data/products";
import { formatPrice } from "../src/lib/pricing";

const MARQUEE_ITEMS = [
  "Give Love",
  "Back",
  "Wear Your Truth",
  "Hand Stamped In Windhoek",
  "Letter No. 01",
  "Made With Care",
  "GLB · 2026",
];

const DATE_LINE = "Posted from Windhoek · 14°S 17°E";

export default function Home() {
  const [heroSlides, setHeroSlides] = useState([]);

  const featured = useMemo(() => PRODUCTS.slice(0, 4), []);
  const collections = useMemo(() => {
    const seen = new Map();
    PRODUCTS.forEach((p) => {
      if (!seen.has(p.collection)) seen.set(p.collection, []);
      seen.get(p.collection).push(p);
    });
    return Array.from(seen, ([name, items]) => ({ name, count: items.length }));
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/hero-slideshow", { cache: "no-store" })
      .then((r) => r.json())
      .then((p) => {
        if (!mounted) return;
        if (p?.success && Array.isArray(p.data)) setHeroSlides(p.data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const heroA = heroSlides[0] || "/assets/IMG_8332.jpg";
  const heroB = heroSlides[1] || "/assets/IMG_8569.jpg";
  const heroC = heroSlides[2] || "/assets/hero.jpg";

  return (
    <main className="bg-paper text-ink">
      {/* ─────────── HERO · Letter No. 01 ─────────── */}
      <section className="glb-hero">
        <div className="glb-shell">
          {/* masthead row */}
          <div className="flex items-center justify-between border-b border-ink pb-4 anim-rise">
            <span className="glb-caption uppercase tracking-[0.22em]">
              Vol. III · Issue 02 · Autumn 2026
            </span>
            <span className="glb-caption hidden sm:inline">{DATE_LINE}</span>
            <span className="glb-eyebrow-stamp">N$ · NA</span>
          </div>

          <div className="glb-hero-grid mt-10 sm:mt-14">
            {/* LEFT — typographic statement */}
            <div className="col-span-12 lg:col-span-7 relative">
              <p className="glb-num anim-rise delay-1">№ 01 / Letter to a city we love</p>

              <h1 className="glb-display mt-6 anim-rise-r delay-2 text-[clamp(3.2rem,11vw,9.5rem)]">
                Give
                <br />
                <em>love,</em>
                <br />
                <span className="ml-[0.4em]">back.</span>
              </h1>

              {/* hand-stamped circle, absolute over title */}
              <span
                className="glb-stamp anim-stamp delay-3 absolute right-2 sm:right-8 top-2 sm:top-8 hidden sm:inline-flex"
                aria-hidden="true"
              >
                Hand
                <br />
                stamped
                <br />
                · MMXXVI ·
              </span>

              <p className="glb-lede mt-8 anim-rise delay-4">
                A community-first clothing house from Namibia. We print the things we
                wish someone had told us — on cotton, on canvas, on caps — and send
                them back into the streets that raised us.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4 anim-rise delay-5">
                <Link href="/shop" className="glb-btn glb-btn-ink">
                  Read the catalogue
                </Link>
                <Link href="/about" className="glb-btn glb-btn-ghost">
                  Our love letter
                </Link>
              </div>

              {/* footnotes / index */}
              <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-ink pt-6 anim-rise delay-6">
                <div>
                  <dt className="glb-caption uppercase">01 · Capsules</dt>
                  <dd className="mt-2 font-display text-2xl tracking-tight">Six, &amp; counting</dd>
                </div>
                <div>
                  <dt className="glb-caption uppercase">02 · Founders</dt>
                  <dd className="mt-2 font-display text-2xl tracking-tight">Four hearts</dd>
                </div>
                <div>
                  <dt className="glb-caption uppercase">03 · Mode</dt>
                  <dd className="mt-2 font-display text-2xl italic text-vermillion tracking-tight">
                    Limited
                  </dd>
                </div>
              </dl>
            </div>

            {/* RIGHT — photo stack */}
            <div className="col-span-12 lg:col-span-5">
              <div className="glb-photo-stack">
                <div
                  className="glb-photo anim-rise-r delay-3"
                  data-caption="Fig. A — campaign frame"
                  style={{
                    width: "70%",
                    height: "70%",
                    top: "0%",
                    right: "8%",
                    transform: "rotate(2.4deg)",
                    zIndex: 2,
                  }}
                >
                  <span>
                    <Image src={heroA} alt="GLB campaign frame" fill className="object-cover" priority sizes="(min-width: 1024px) 30vw, 70vw" />
                  </span>
                </div>
                <div
                  className="glb-photo anim-rise-r delay-4"
                  data-caption="Fig. B — street, Windhoek"
                  style={{
                    width: "62%",
                    height: "58%",
                    bottom: "2%",
                    left: "0%",
                    transform: "rotate(-3.2deg)",
                    zIndex: 3,
                  }}
                >
                  <span>
                    <Image src={heroB} alt="GLB street" fill className="object-cover" sizes="(min-width: 1024px) 26vw, 60vw" />
                  </span>
                </div>
                <div
                  className="glb-photo anim-rise-r delay-5"
                  data-caption="Fig. C — atelier"
                  style={{
                    width: "44%",
                    height: "38%",
                    bottom: "12%",
                    right: "2%",
                    transform: "rotate(5deg)",
                    zIndex: 4,
                  }}
                >
                  <span>
                    <Image src={heroC} alt="GLB atelier" fill className="object-cover" sizes="(min-width: 1024px) 18vw, 40vw" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── MARQUEE STRIP ─────────── */}
      <section className="glb-marquee" aria-hidden="true">
        <div className="glb-marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={`${item}-${i}`} className="glb-marquee-item">
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ─────────── MANIFESTO · ruled paper ─────────── */}
      <section className="glb-manifesto">
        <div className="glb-manifesto-margin" />
        <div className="glb-shell relative">
          <div className="grid grid-cols-12 gap-8 items-start">
            <aside className="col-span-12 lg:col-span-3">
              <p className="glb-num">№ 02 — Manifesto</p>
              <p className="glb-caption mt-3 max-w-[28ch]">
                Read aloud, slowly. Pass it on if it lands.
              </p>
            </aside>

            <div className="col-span-12 lg:col-span-9">
              <p className="glb-display text-[clamp(1.6rem,3.6vw,3.2rem)] leading-[1.15] tracking-tight">
                We don&apos;t make clothes for trends. We make{" "}
                <em>love letters</em> you can wear — printed by people who know your
                streets, sewn for the friends who showed up, cut for the version of
                you that <em>tells the truth</em> on a Tuesday morning.
              </p>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  ["i.", "Cotton, never compromise", "Combed ring-spun. 180gsm. Built for years, not seasons."],
                  ["ii.", "Made in small batches", "If a piece sells out, it stays out — until the next letter arrives."],
                  ["iii.", "A portion goes home", "A slice of every drop funds community projects across Namibia."],
                ].map(([num, h, p]) => (
                  <div key={num} className="border-t border-ink pt-4">
                    <p className="font-mono text-vermillion text-xs tracking-[0.22em]">{num}</p>
                    <h3 className="font-display text-xl mt-3 tracking-tight">{h}</h3>
                    <p className="glb-caption mt-2 leading-relaxed normal-case tracking-normal text-[0.78rem]">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── FEATURED · Tear sheets ─────────── */}
      <section className="glb-section">
        <div className="glb-shell">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink pb-6">
            <div>
              <p className="glb-num">№ 03 — From the catalogue</p>
              <h2 className="glb-display mt-3 text-[clamp(2.2rem,5vw,4.5rem)]">
                Pieces, <em>currently</em> in print
              </h2>
            </div>
            <Link href="/shop" className="glb-btn glb-btn-stamp">
              See the full edition
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {featured.map((p, i) => {
              const idx = String(i + 1).padStart(2, "0");
              return (
                <Link
                  key={p.id}
                  href={`/shop/${p.id}`}
                  className="glb-tearsheet group"
                  style={{
                    transform: i % 2 === 0 ? "rotate(-0.4deg)" : "rotate(0.4deg)",
                  }}
                >
                  <span className="glb-corner-num">№ {idx}</span>
                  <div className="glb-tearsheet-frame">
                    <Image
                      src={`/assets/${p.file}`}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="(min-width:1024px) 22vw, 50vw"
                    />
                  </div>
                  <div className="glb-tearsheet-meta">
                    <div className="glb-cat-row">
                      <span className="cat">{p.collection}</span>
                      <span>Plate {idx}</span>
                    </div>
                    <h3 className="glb-tearsheet-name">{p.name}</h3>
                    <div className="flex items-center justify-between pt-1 border-t border-hairline">
                      <span className="glb-tearsheet-price">{formatPrice(p.price)}</span>
                      <span className="font-mono text-[0.62rem] tracking-[0.18em] uppercase text-graphite group-hover:text-vermillion transition-colors">
                        Read →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────── COLLECTION INDEX ─────────── */}
      <section className="glb-section pt-0">
        <div className="glb-shell">
          <div className="grid grid-cols-12 gap-6 sm:gap-10 items-start">
            <div className="col-span-12 lg:col-span-4">
              <p className="glb-num">№ 04 — Index</p>
              <h2 className="glb-display mt-3 text-[clamp(2rem,4vw,3.5rem)]">
                Capsules, <em>filed by</em> chapter
              </h2>
              <p className="glb-lede mt-5">
                Each capsule is a self-contained letter. Different season,
                different message — same handwriting.
              </p>
            </div>

            <ol className="col-span-12 lg:col-span-8 list-none m-0 p-0">
              {collections.map((c, i) => (
                <li key={c.name}>
                  <Link href="/shop" className="glb-index-row">
                    <span className="glb-index-num">№ {String(i + 1).padStart(2, "0")}</span>
                    <span className="glb-index-name">
                      {c.name.split(" ").map((w, idx) => (
                        <span key={idx}>
                          {idx === 1 ? <em>{w} </em> : `${w} `}
                        </span>
                      ))}
                    </span>
                    <span className="glb-index-tag">{c.count} pieces</span>
                    <span className="glb-index-arrow">→</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ─────────── EDITORIAL DUO IMAGE ─────────── */}
      <section className="glb-section pt-0">
        <div className="glb-shell">
          <div className="grid grid-cols-12 gap-5 sm:gap-8">
            <figure className="col-span-12 sm:col-span-7 relative aspect-[4/5] sm:aspect-[5/6] border border-ink overflow-hidden">
              <Image
                src={heroA}
                alt="Editorial frame"
                fill
                className="object-cover"
                sizes="(min-width:768px) 58vw, 100vw"
              />
              <figcaption className="absolute bottom-3 left-4 right-4 flex justify-between glb-caption text-paper-warm bg-ink/85 px-3 py-2">
                <span>Plate 01 — Embrace It · Black</span>
                <span>F/2026</span>
              </figcaption>
            </figure>

            <div className="col-span-12 sm:col-span-5 flex flex-col">
              <figure className="relative aspect-[4/5] border border-ink overflow-hidden">
                <Image
                  src={heroB}
                  alt="Editorial detail"
                  fill
                  className="object-cover"
                  sizes="(min-width:768px) 38vw, 100vw"
                />
                <figcaption className="absolute bottom-3 left-3 right-3 flex justify-between glb-caption text-paper-warm bg-ink/85 px-3 py-2">
                  <span>Plate 02 — Detail</span>
                  <span>F/2026</span>
                </figcaption>
              </figure>

              <div className="mt-6 flex-1 flex flex-col justify-end">
                <p className="glb-num">№ 05 — Postscript</p>
                <p className="glb-display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.05] mt-3">
                  P.S. — <em>tell someone</em> you love them today.
                </p>
                <Link href="/events" className="glb-btn glb-btn-ghost mt-6 self-start">
                  Upcoming gatherings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── SIGNUP / CORRESPONDENCE ─────────── */}
      <section className="glb-signup">
        <div className="glb-shell">
          <div className="grid grid-cols-12 gap-6 sm:gap-10 items-end">
            <div className="col-span-12 lg:col-span-7">
              <p className="font-mono text-vermillion text-[0.66rem] tracking-[0.22em] uppercase">
                № 06 — Correspondence
              </p>
              <h2 className="font-display mt-4 text-[clamp(2rem,5vw,4.2rem)] leading-[0.95] tracking-tight">
                Get the next <em className="italic text-vermillion font-light">letter</em>
                <br />in your inbox.
              </h2>
              <p className="glb-caption normal-case tracking-wide mt-4 max-w-[44ch] text-[#C9BEA7]">
                One short note per drop. Early access, behind-the-scenes
                photos, the occasional poem. No noise.
              </p>
            </div>

            <form
              className="col-span-12 lg:col-span-5"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="block">
                <span className="font-mono text-[0.6rem] tracking-[0.22em] uppercase text-[#C9BEA7]">
                  Your address
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@somewhere.world"
                  className="glb-signup-input mt-2"
                />
              </label>
              <button
                type="submit"
                className="glb-btn glb-btn-stamp mt-5"
                style={{ borderColor: "var(--vermillion)" }}
              >
                Seal &amp; send
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
