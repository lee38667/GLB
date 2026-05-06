"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const stories = [
  {
    title: "Street Cache Volume 1",
    body: "Captured between stalls, decks, and drop moments at Street Cache Volume 1. Embrace It and GLB Classic tees pair with truckers to keep the message visible from every angle.",
    image: "/assets/IMG-20250919-WA0041.jpg",
    vibe: "In Session",
  },
  {
    title: "Studio Layouts",
    body: "Flat lays inside the GLB studio. Classic tees, totes, and accessories come together on the table before heading out into the city.",
    image: "/assets/IMG-20250919-WA0032.jpg",
    vibe: "Behind The Scenes",
  },
  {
    title: "Winter Lore Session",
    body: "Colder nights, warmer layers. Love Dept Winter Lore pieces sit alongside GLB truckers and totes as the crew resets between sets.",
    image: "/assets/IMG-20250919-WA0025.jpg",
    vibe: "Winter Lore",
  },
];

export default function ParallaxStories() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const upward = useTransform(scrollYProgress, [0, 1], [0, -130]);
  const downward = useTransform(scrollYProgress, [0, 1], [0, 130]);

  return (
    <section ref={containerRef} className="mx-auto max-w-6xl px-6 sm:px-10">
      <div className="bento-board mb-10">
        <motion.div
          className="bento-tile bento-span-8 p-7"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.17, 0.67, 0.36, 0.99] }}
        >
          <div className="bento-content">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-tide/80">
            Field Notes
          </span>
          <h2 className="mt-4 max-w-2xl font-display text-4xl tracking-tight text-sand sm:text-5xl">
            Built on collaboration. Captured in motion.
          </h2>
          </div>
        </motion.div>
        <motion.p
          className="bento-tile bento-span-4 bento-content p-6 text-sm leading-relaxed text-clay/80"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          From open‑air pop‑ups to studio sessions, these frames trace the community that makes GLB possible—bringing care,
          connection, and style into every scene.
        </motion.p>
      </div>

      <div className="bento-board">
        {stories.map((story, index) => {
          const motionStyle = index % 2 === 0 ? { y: upward } : { y: downward };

          return (
            <motion.article
              key={story.title}
              style={motionStyle}
              className={`bento-tile p-6 ${index === 0 ? "bento-span-6" : "bento-span-3"}`}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.65, ease: [0.17, 0.67, 0.36, 0.99] }}
            >
              <div className="bento-content">
              <div className="relative h-64 overflow-hidden rounded-3xl border border-white/5">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  sizes="(min-width: 1024px) 28vw, (min-width: 768px) 45vw, 90vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <span className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[0.6rem] uppercase tracking-[0.4em] text-sand">
                  {story.vibe}
                </span>
              </div>
              <h3 className="mt-5 font-display text-2xl text-sand">{story.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-clay/80">{story.body}</p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
