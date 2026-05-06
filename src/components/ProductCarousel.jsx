"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { PRODUCTS } from "../data/products";
import { formatPrice } from "../lib/pricing";

export default function ProductCarousel() {
  const featured = PRODUCTS.slice(0, 6);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-advance carousel every 4 seconds
  useEffect(() => {
    if (isPaused) return undefined;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [featured.length, isPaused]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 sm:px-10">
      <div className="bento-board">
        <motion.div
          className="bento-tile bento-span-8 p-7"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.17, 0.67, 0.36, 0.99] }}
        >
          <div className="bento-content">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-tide/80">
            Best Sellers
          </span>
          <h2 className="mt-4 font-display text-4xl tracking-tight text-sand sm:text-5xl">
            Most wanted, right now.
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
          These are the pieces customers come back for: expressive essentials with elevated fit and finish.
        </motion.p>
      </div>

      <motion.div
        className="bento-tile relative bento-content overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-black/60 via-charcoal/70 to-black/40 shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.8, ease: [0.17, 0.67, 0.36, 0.99] }}
      >
        <div className="relative h-[480px] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95, x: 60 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -60 }}
              transition={{ duration: 0.5, ease: [0.17, 0.67, 0.36, 0.99] }}
              className="absolute inset-0 flex flex-col items-center justify-center p-10"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative h-[320px] w-[240px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <Image
                  src={`/assets/${featured[currentIndex].file}`}
                  alt={featured[currentIndex].name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <h3 className="mt-6 font-display text-2xl tracking-tight text-sand">
                {featured[currentIndex].name}
              </h3>
              <p className="mt-2 max-w-md text-center text-sm leading-relaxed text-clay/75">
                {featured[currentIndex].description}
              </p>
              <div className="mt-4 text-xl font-semibold text-flare">{formatPrice(featured[currentIndex].price)}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink via-ink/70 to-transparent" />

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-sand backdrop-blur transition hover:border-white/40 hover:bg-white/10"
          aria-label="Previous product"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={goToNext}
          className="absolute right-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-sand backdrop-blur transition hover:border-white/40 hover:bg-white/10"
          aria-label="Next product"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
          {featured.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-8 bg-flare" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to product ${index + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
