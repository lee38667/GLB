"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("glb-loading-complete"));
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 1.3, ease: [0.17, 0.67, 0.36, 0.99] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-lg"
        >
          <Image
            src="/assets/hero.jpg"
            alt="GLB Hero Background"
            fill
            className="object-cover absolute inset-0 w-full h-full blur-md opacity-60"
            priority
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center px-6"
          >
            <div className="mb-6 md:mb-8 lg:mb-10">
              <span className="relative block" style={{ width: 64, height: 64 }}>
                <Image
                  src="/assets/logo.png"
                  alt="GLB logo"
                  fill
                  className="object-contain drop-shadow-[0_0_22px_rgba(255,255,255,0.3)] md:scale-125 lg:scale-150"
                />
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-sand drop-shadow-[0_0_16px_rgba(255,255,255,0.18)] mb-6 md:mb-8 lg:mb-10 text-center max-w-4xl leading-tight">
              Welcome to the GLB Experience
            </h1>
            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 border-4 md:border-[5px] lg:border-[6px] border-tide border-t-transparent rounded-full animate-spin" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
