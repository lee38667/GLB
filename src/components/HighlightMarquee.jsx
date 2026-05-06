"use client";

import { motion } from "framer-motion";

const highlights = [
  "GIVE LOVE BACK",
  "Quiet Luxury",
  "Street Culture",
  "Identity Over Noise",
  "Crafted In Limited Drops",
  "Designed To Belong",
];

export default function HighlightMarquee() {
  const sequence = [...highlights, ...highlights];

  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-black/30 py-5">
      <motion.div
        className="flex min-w-max items-center gap-12"
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{ repeat: Infinity, ease: "linear", duration: 18 }}
      >
        {sequence.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="text-[0.6rem] uppercase tracking-[0.35em] text-clay/70 sm:text-xs sm:tracking-[0.55em]"
          >
            {item}
          </span>
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink via-ink/60 to-transparent" />
    </div>
  );
}
