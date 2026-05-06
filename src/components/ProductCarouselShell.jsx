"use client";

import { useMemo, useState, useEffect } from "react";

import { PRODUCTS } from "../data/products";

const LOADING_ITEMS = PRODUCTS.slice(0, 6).map((product) => ({
  name: product.name,
  descriptor: product.description,
}));

function LoadingShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(
    () => (LOADING_ITEMS.length > 0 ? LOADING_ITEMS : [{ name: "GLB Capsule", descriptor: "Immersive textures loading" }]),
    [],
  );

  useEffect(() => {
    if (items.length <= 1) return undefined;

    const rotation = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % items.length);
    }, 1600);

    return () => window.clearInterval(rotation);
  }, [items.length]);

  const activeItem = items[activeIndex];
  const nextItem = items[(activeIndex + 1) % items.length];

  return (
    <div className="mx-auto mt-24 flex h-[420px] w-full max-w-5xl items-center justify-center rounded-3xl border border-white/5 bg-charcoal/60 px-10 py-12">
      <div className="flex w-full flex-col gap-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4 text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-clay/70">
            Loading Showcase
          </span>
          <h3 className="font-display text-3xl tracking-tight text-sand sm:text-4xl">{activeItem.name}</h3>
          <p className="max-w-sm text-sm leading-relaxed text-clay/75">{activeItem.descriptor}</p>
        </div>

        <div className="relative flex w-full max-w-xs flex-col gap-3 md:max-w-sm">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-xs uppercase tracking-[0.3em] text-clay/60">
            Next Up
            <div className="mt-3 text-base tracking-normal text-sand">{nextItem.name}</div>
          </div>
          <ul className="grid gap-2 text-xs uppercase tracking-[0.32em] text-clay/50">
            {items.map((item, index) => (
              <li
                key={item.name}
                className={`rounded-full border border-white/5 px-4 py-2 transition ${
                  index === activeIndex ? "border-white/40 bg-white/15 text-sand" : "bg-white/5"
                }`}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ProductCarouselShell() {
  const [Carousel, setCarousel] = useState(null);

  useEffect(() => {
    let active = true;

    import("./ProductCarousel")
      .then((mod) => {
        if (active) setCarousel(() => mod.default);
      })
      .catch((error) => {
        console.error("Failed to load ProductCarousel", error);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!Carousel) {
    return <LoadingShowcase />;
  }

  const RenderCarousel = Carousel;

  return <RenderCarousel />;
}
