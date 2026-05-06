import Image from "next/image";
import Link from "next/link";

const PRINCIPLES = [
  {
    num: "i.",
    title: "Wear your truth",
    text:
      "Each piece carries language. We print what we wish someone had told us — on cotton built to outlive a season.",
  },
  {
    num: "ii.",
    title: "Built with the city",
    text:
      "Photographers, models, printers, organisers — Windhoek made every drop with us. The credits run long.",
  },
  {
    num: "iii.",
    title: "Small and slow",
    text:
      "We make in batches. When a letter sells out, it stays out. Scarcity isn't a tactic; it's the way care is paced.",
  },
];

const NOTES = [
  ["2024", "Four friends share an idea over coffee in Klein Windhoek."],
  ["2024", "First t-shirt — a hand-printed proof, gifted, never sold."],
  ["2025", "GLB Classic capsule lands. The catalogue arrives in print."],
  ["2025", "Embrace It launches; Street Cache Vol. 1 fills the courtyard."],
  ["2026", "You're reading the next letter."],
];

export default function AboutPage() {
  return (
    <main className="bg-paper text-ink">
      {/* HERO */}
      <section className="glb-hero">
        <div className="glb-shell">
          <div className="flex items-center justify-between border-b border-ink pb-4">
            <span className="glb-caption uppercase tracking-[0.22em]">
              Letter № 02 · About
            </span>
            <span className="glb-eyebrow-stamp">Since MMXXIV</span>
          </div>

          <div className="grid grid-cols-12 gap-8 mt-12 items-end">
            <div className="col-span-12 lg:col-span-8 anim-rise">
              <p className="glb-num">A short note on who we are</p>
              <h1 className="glb-display mt-5 text-[clamp(2.6rem,8vw,7rem)]">
                We started <em>writing letters,</em>
                <br />
                <span>printed on cotton.</span>
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 anim-rise delay-2">
              <p className="glb-lede">
                Give Love Back is a community-first clothing house from Windhoek,
                Namibia. Four founders, a printer, and a long list of friends.
                We design pieces that carry care into the streets that raised us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PORTRAIT + STORY */}
      <section className="glb-section pt-0">
        <div className="glb-shell">
          <div className="grid grid-cols-12 gap-6 sm:gap-10 items-start">
            <figure className="col-span-12 lg:col-span-7 relative aspect-[5/4] border border-ink overflow-hidden">
              <Image
                src="/assets/IMG_8332.jpg"
                alt="GLB founders portrait"
                fill
                sizes="(min-width:1024px) 58vw, 100vw"
                className="object-cover"
              />
              <figcaption className="absolute bottom-3 left-3 right-3 flex justify-between glb-caption text-paper-warm bg-ink/85 px-3 py-2">
                <span>Plate 01 — The Atelier</span>
                <span>Windhoek · 2026</span>
              </figcaption>
            </figure>

            <div className="col-span-12 lg:col-span-5 lg:pt-8">
              <p className="glb-num">№ 03 — Origin</p>
              <h2 className="glb-display mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)]">
                Four friends, <em>one</em> question.
              </h2>
              <div className="mt-5 space-y-4 glb-lede">
                <p>
                  What can happen when creative skill, discipline, and love
                  point in the same direction? GLB is that question, in
                  motion — and worn outside.
                </p>
                <p>
                  We didn&apos;t want another logo with no soul. We wanted a
                  living platform where people could wear values, build
                  together, and show up for one another in public.
                </p>
                <p>
                  This isn&apos;t fashion as noise. It&apos;s fashion as
                  language. Each release is built to be worn hard, remembered
                  clearly, and tied to something that gives back.
                </p>
              </div>
              <Link href="/shop" className="glb-btn glb-btn-ink mt-8">
                Read the catalogue
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRINCIPLES — ruled paper */}
      <section className="glb-manifesto">
        <div className="glb-manifesto-margin" />
        <div className="glb-shell">
          <p className="glb-num">№ 04 — Principles</p>
          <h2 className="glb-display mt-3 text-[clamp(1.8rem,3.6vw,3rem)]">
            Three things we keep <em>repeating</em>.
          </h2>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {PRINCIPLES.map((p) => (
              <article key={p.title} className="border-t border-ink pt-5">
                <p className="font-mono text-vermillion text-xs tracking-[0.22em]">
                  {p.num}
                </p>
                <h3 className="font-display text-2xl mt-3 tracking-tight leading-tight">
                  {p.title}
                </h3>
                <p className="glb-caption normal-case tracking-normal text-[0.82rem] mt-3 leading-relaxed">
                  {p.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE / NOTES */}
      <section className="glb-section">
        <div className="glb-shell">
          <div className="grid grid-cols-12 gap-6 sm:gap-10 items-start">
            <div className="col-span-12 lg:col-span-4">
              <p className="glb-num">№ 05 — Margin notes</p>
              <h2 className="glb-display mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)]">
                The short, <em>unofficial</em> history.
              </h2>
            </div>

            <ol className="col-span-12 lg:col-span-8 list-none p-0 m-0 border-t border-ink">
              {NOTES.map(([year, line], i) => (
                <li
                  key={`${year}-${i}`}
                  className="grid grid-cols-[5rem_1fr] sm:grid-cols-[8rem_1fr] gap-4 py-5 border-b border-hairline"
                >
                  <span className="font-mono text-vermillion text-sm tracking-[0.16em]">
                    {year}
                  </span>
                  <span className="font-display text-xl sm:text-2xl tracking-tight leading-snug">
                    {line}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="glb-signup">
        <div className="glb-shell">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
            <div>
              <p className="font-mono text-vermillion text-[0.66rem] tracking-[0.22em] uppercase">
                P.S.
              </p>
              <h2 className="font-display mt-4 text-[clamp(2rem,4vw,3.6rem)] leading-[0.95] tracking-tight">
                Want to <em className="italic text-vermillion font-light">build</em> with us?
              </h2>
            </div>
            <div className="flex gap-3">
              <Link href="/contact" className="glb-btn glb-btn-stamp">
                Write to us
              </Link>
              <Link href="/events" className="glb-btn glb-btn-light">
                See events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
