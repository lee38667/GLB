"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      type: "contact",
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    setStatus({ type: "idle", message: "" });
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        setStatus({
          type: "error",
          message:
            result?.error || "Letter didn't send. Try again in a moment.",
        });
        return;
      }

      setStatus({
        type: "success",
        message: "Letter received. We'll write back soon.",
      });
      form.reset();
    } catch {
      setStatus({
        type: "error",
        message: "Network issue — please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-paper text-ink">
      <section className="glb-hero">
        <div className="glb-shell">
          <div className="flex items-center justify-between border-b border-ink pb-4">
            <span className="glb-caption uppercase tracking-[0.22em]">
              Letter № 06 · Correspondence
            </span>
            <span className="glb-eyebrow-stamp">Hello@</span>
          </div>

          <div className="grid grid-cols-12 gap-8 mt-12 items-end">
            <div className="col-span-12 lg:col-span-8 anim-rise">
              <p className="glb-num">Tell us a story, send a brief, say hi</p>
              <h1 className="glb-display mt-5 text-[clamp(2.6rem,8vw,7rem)]">
                Write to <em>us.</em>
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 anim-rise delay-2">
              <p className="glb-lede">
                Collaborations, wholesale, events, press — or just to say
                something kind. Letters land in our inbox within the day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FORM + ADDRESS BLOCK */}
      <section className="glb-section pt-0">
        <div className="glb-shell">
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* address card — postcard style */}
            <aside className="col-span-12 lg:col-span-4 anim-rise">
              <div
                className="border border-ink p-7 bg-paper-warm relative"
                style={{ boxShadow: "8px 8px 0 0 var(--vermillion)" }}
              >
                <p className="glb-num">№ 07 — Atelier</p>
                <h2 className="glb-display mt-4 text-[clamp(1.6rem,2.4vw,2.2rem)]">
                  Windhoek<span className="text-vermillion">,</span>
                  <br />
                  <em>Namibia.</em>
                </h2>

                <dl className="mt-6 space-y-4 text-sm">
                  <div className="border-t border-hairline pt-3">
                    <dt className="font-mono text-[0.6rem] tracking-[0.22em] uppercase text-graphite">
                      Studio
                    </dt>
                    <dd className="mt-1 font-display text-lg tracking-tight">
                      hello@giveloveback.com
                    </dd>
                  </div>
                  <div className="border-t border-hairline pt-3">
                    <dt className="font-mono text-[0.6rem] tracking-[0.22em] uppercase text-graphite">
                      Hours
                    </dt>
                    <dd className="mt-1 font-display text-lg tracking-tight">
                      Mon — Fri · 09:00–17:00
                    </dd>
                  </div>
                  <div className="border-t border-hairline pt-3">
                    <dt className="font-mono text-[0.6rem] tracking-[0.22em] uppercase text-graphite">
                      Visits
                    </dt>
                    <dd className="mt-1 font-display text-lg tracking-tight">
                      By appointment, with tea
                    </dd>
                  </div>
                </dl>

                {/* postage stamp corner */}
                <span
                  aria-hidden
                  className="absolute -top-6 -right-6"
                  style={{ transform: "rotate(8deg)" }}
                >
                  <span className="glb-stamp" style={{ transform: "rotate(0)" }}>
                    Air
                    <br />
                    mail
                    <br />· NA ·
                  </span>
                </span>
              </div>
            </aside>

            {/* form */}
            <form
              onSubmit={handleSubmit}
              className="col-span-12 lg:col-span-8 anim-rise delay-2"
              noValidate
            >
              <p className="glb-num">№ 08 — Your letter</p>
              <h3 className="glb-display mt-3 text-[clamp(1.6rem,3vw,2.6rem)]">
                Address an envelope to us<span className="text-vermillion">.</span>
              </h3>

              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                <label className="block">
                  <span className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-graphite">
                    From
                  </span>
                  <input
                    name="name"
                    required
                    placeholder="Your name"
                    className="brand-input mt-2 font-display text-lg italic"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-graphite">
                    Reply to
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@somewhere.world"
                    className="brand-input mt-2 font-display text-lg italic"
                  />
                </label>
              </div>

              <label className="block mt-8">
                <span className="font-mono text-[0.62rem] tracking-[0.22em] uppercase text-graphite">
                  Subject
                </span>
                <textarea
                  name="message"
                  required
                  rows={6}
                  placeholder="Tell us what's on your mind — collaboration, event, press, or hello."
                  className="brand-textarea mt-2 font-display text-xl italic leading-relaxed"
                />
              </label>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink pt-6">
                <p className="glb-caption">
                  Sealed in transit · responses within 1–2 days
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="glb-btn glb-btn-ink disabled:opacity-50"
                >
                  {isSubmitting ? "Sealing…" : "Seal & send"}
                </button>
              </div>

              {status.type !== "idle" && (
                <p
                  className={`mt-6 border px-4 py-3 text-sm font-mono tracking-wide ${
                    status.type === "success"
                      ? "border-ink bg-paper-warm text-ink"
                      : "border-vermillion bg-paper-warm text-vermillion"
                  }`}
                >
                  {status.message}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* alt CTAs */}
      <section className="glb-section pt-0">
        <div className="glb-shell">
          <div className="border-t border-ink pt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              ["Press", "press@giveloveback.com", "Editorial requests, samples, interviews."],
              ["Wholesale", "stockists@giveloveback.com", "Boutique partners and pop-up stockists."],
              ["Collabs", "studio@giveloveback.com", "Artists, photographers, community projects."],
            ].map(([h, m, p]) => (
              <article key={h} className="border-t border-vermillion pt-5">
                <p className="font-mono text-vermillion text-xs tracking-[0.22em]">{h}</p>
                <h3 className="font-display text-xl mt-3 tracking-tight">{m}</h3>
                <p className="glb-caption normal-case tracking-normal text-[0.78rem] mt-2 leading-relaxed">
                  {p}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/about" className="glb-btn glb-btn-ghost">Read about us</Link>
            <Link href="/events" className="glb-btn glb-btn-ghost">Upcoming events</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
