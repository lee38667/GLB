"use client";

import Image from "next/image";
import Link from "next/link";

export default function Logo({ href = "/", size = 28, showWordmark = false, isLight = false }) {
  // Uses the provided PNG from attachments placed in /public/assets/logo.png
  // Falls back to text if image fails to load
  return (
    <Link href={href} className="inline-flex items-center gap-3 focus:outline-none">
      <span className="relative block" style={{ width: size, height: size }}>
        <Image
          src="/assets/logo.png"
          alt="GLB logo"
          fill
          sizes={`${size}px`}
          className={`object-contain ${
            isLight
              ? "drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
              : "drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
          }`}
          priority
        />
      </span>
      {showWordmark && (
        <span
          className={`font-display text-lg uppercase tracking-[0.28em] ${
            isLight ? "text-black" : "text-sand"
          }`}
        >
          Give Love Back
        </span>
      )}
    </Link>
  );
}
