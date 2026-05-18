"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Lock } from "lucide-react";

export default function StickyCTA({ targetId = "boutique", price }: { targetId?: string, price?: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Apparaît après 500px de scroll
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCheckout = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[100] lg:hidden shadow-2xl"
        >
          <button
            onClick={scrollToCheckout}
            className="w-full bg-gold text-black h-[60px] flex items-center justify-between px-6 active:scale-[0.98] transition-all relative overflow-hidden"
          >
            {/* Shimmer Effect */}
            <motion.div
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.4] to-transparent pointer-events-none"
            />

            <div className="flex items-center gap-3 relative z-10">
              <Lock className="w-5 h-5 text-black" />
              <div className="flex flex-col items-start">
                <span className="font-display text-base md:text-lg uppercase tracking-widest font-black leading-none mb-1">TÉLÉCHARGER LE PDF</span>
                {price && <span className="font-sans text-[11px] font-bold opacity-80 uppercase leading-none">{price}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2 relative z-10 bg-black text-gold px-4 py-2 rounded">
              <span className="text-[10px] uppercase tracking-widest font-black">VALIDER</span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
