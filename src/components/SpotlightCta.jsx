"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SpotlightCta() {
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <section className="mx-auto max-w-5xl px-6 sm:px-10">
      <motion.div
        className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-flare/10 via-black/60 to-tide/10 p-10 text-center backdrop-blur"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.65, ease: [0.17, 0.67, 0.36, 0.99] }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-sand/80">
          Insider List
        </span>
        <h2 className="mt-6 font-display text-4xl tracking-tight text-sand sm:text-5xl">
          Be the first to know.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-clay/80">
          Join the GLB insider list for drops, events, and stories from the community. No spam—just the next step in
          giving love back.
        </p>
        <form
          className="mx-auto mt-8 flex max-w-md flex-col gap-4 sm:flex-row"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const emailField = form.elements.namedItem("email");
            const email = typeof emailField?.value === "string" ? emailField.value : "";
            if (email) {
              setStatus({ type: "idle", message: "" });
              setIsSubmitting(true);
              try {
                const response = await fetch("/api/contact", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ type: "newsletter", email }),
                });
                const result = await response.json();
                if (!response.ok || !result?.success) {
                  setStatus({
                    type: "error",
                    message: result?.error || "Signup failed. Please try again.",
                  });
                  return;
                }

                setStatus({ type: "success", message: "You are on the insider list." });
                form.reset();
              } catch (error) {
                console.error("Newsletter signup error:", error);
                setStatus({ type: "error", message: "Network issue. Please retry shortly." });
              } finally {
                setIsSubmitting(false);
              }
            }
          }}
        >
          <input
            type="email"
            name="email"
            required
            placeholder="email@domain.com"
            className="flex-1 rounded-full border border-white/10 bg-black/40 px-5 py-3 text-sm text-sand placeholder:text-clay/50 focus:border-flare/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-gradient-to-r from-white via-zinc-300 to-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-ink shadow-[0_18px_32px_rgba(255,255,255,0.14)] transition hover:shadow-[0_24px_42px_rgba(255,255,255,0.22)]"
          >
            {isSubmitting ? "Joining..." : "Join"}
          </button>
        </form>
        {status.type !== "idle" && (
          <p
            className={`mx-auto mt-4 max-w-md rounded-2xl border px-4 py-3 text-sm ${status.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
          >
            {status.message}
          </p>
        )}
        <Link
          href="/store"
          className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-sand/70 transition hover:text-flare"
        >
          Or head straight to the store →
        </Link>
      </motion.div>
    </section>
  );
}
