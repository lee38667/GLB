"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { PRODUCTS } from "../data/products";
import { formatPrice } from "../lib/pricing";
import { useCart } from "../state/CartContext";

const PRODUCT_MAP = PRODUCTS.reduce((accumulator, product) => {
  accumulator[product.id] = product;
  return accumulator;
}, {});

export default function CartWidget({ isLight = false }) {
  const { cart, change, remove } = useCart();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  const { count, subtotal } = useMemo(() => {
    const summary = cart.reduce(
      (acc, item) => {
        const product = PRODUCT_MAP[item.id];
        if (!product) return acc;
        acc.count += item.qty;
        acc.subtotal += product.price * item.qty;
        return acc;
      },
      { count: 0, subtotal: 0 },
    );
    return summary;
  }, [cart]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition ${isLight
          ? "border-black/20 bg-white/60 text-black hover:border-black/40"
          : "border-white/20 bg-black/55 text-white hover:border-white/45"
          }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 5h2l1.5 9.5A2 2 0 0 0 8.5 16h7a2 2 0 0 0 1.98-1.7L19 8H6" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="17" cy="19" r="1" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-black">
            {count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-12 z-40 w-[22rem] rounded-3xl border border-white/15 bg-[#0b0b0b]/95 p-5 text-sm text-white shadow-[0_22px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          >
            <header className="flex items-center justify-between text-[0.62rem] uppercase tracking-[0.22em] text-zinc-400">
              <span>Cart</span>
              <span>{count} items</span>
            </header>
            <div className="mt-4 space-y-4 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
              {cart.length === 0 && (
                <p className="rounded-2xl border border-white/10 bg-black/50 px-4 py-6 text-center text-[0.62rem] uppercase tracking-[0.22em] text-zinc-400">
                  Cart is empty
                </p>
              )}

              {cart.map((item) => {
                const product = PRODUCT_MAP[item.id];
                if (!product) return null;
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-black/50 p-3"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                      <Image
                        src={`/assets/${product.file}`}
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="text-[0.62rem] uppercase tracking-[0.2em] text-zinc-100">{product.name}</span>
                      <span className="text-xs text-zinc-400">{formatPrice(product.price)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-xs"
                          onClick={() => change(item.id, -1)}
                        >
                          –
                        </button>
                        <span className="text-xs tracking-[0.28em] text-zinc-200">{item.qty}</span>
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-xs"
                          onClick={() => change(item.id, 1)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="ml-auto text-[0.58rem] uppercase tracking-[0.2em] text-zinc-500 hover:text-black"
                          onClick={() => remove(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="mt-5 space-y-3 border-t border-white/10 pt-4 text-xs">
              <div className="flex items-center justify-between uppercase tracking-[0.2em] text-zinc-400">
                <span>Subtotal</span>
                <span className="text-zinc-100">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/store"
                  className="flex-1 rounded-full border border-white/20 px-4 py-2 text-center text-[0.62rem] uppercase tracking-[0.2em] text-zinc-100 transition hover:border-white/50"
                  onClick={() => setOpen(false)}
                >
                  View Store
                </Link>
                <Link
                  href="/contact"
                  className="flex-1 rounded-full bg-white px-4 py-2 text-center text-[0.62rem] uppercase tracking-[0.2em] text-black"
                  onClick={() => setOpen(false)}
                >
                  Checkout Help
                </Link>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
