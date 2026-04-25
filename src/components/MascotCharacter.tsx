"use client";

import { motion } from "framer-motion";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";

interface MascotCharacterProps {
  mood?: "idle" | "happy" | "cheering" | "celebrating";
  message: string;
  xpText?: string;
}

export function MascotCharacter({
  mood = "idle",
  message,
  xpText,
}: MascotCharacterProps) {
  const isHappy = mood === "happy" || mood === "cheering" || mood === "celebrating";
  const isCheering = mood === "cheering" || mood === "celebrating";

  return (
    <div className="panel-glow rounded-[30px] p-5">
      <div className="flex items-center gap-4">
        <motion.div
          animate={
            isCheering
              ? { y: [0, -10, 0], scale: [1, 1.06, 1] }
              : isHappy
                ? { y: [0, -5, 0] }
                : { rotate: [0, -2, 2, 0] }
          }
          transition={{
            duration: isCheering ? 1 : 2.6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="relative flex h-28 w-24 shrink-0 items-center justify-center"
        >
          {isCheering ? (
            <>
              <motion.span
                className="absolute left-1 top-2 text-lg text-lime-200"
                animate={{ opacity: [0.35, 1, 0.35], y: [0, -4, 0] }}
                transition={{ duration: 0.7, repeat: Number.POSITIVE_INFINITY }}
              >
                ✦
              </motion.span>
              <motion.span
                className="absolute right-1 top-3 text-lg text-pink-200"
                animate={{ opacity: [0.35, 1, 0.35], y: [0, -4, 0] }}
                transition={{
                  duration: 0.7,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 0.15,
                }}
              >
                ✦
              </motion.span>
            </>
          ) : null}

          <AnimatedHeroMascot size="sm" animated />
        </motion.div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Hero Buddy
          </p>
          <h3 className="mt-2 font-display text-2xl text-white">
            {isHappy ? "Супер ход!" : "Хайде, герой!"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{message}</p>
          {xpText ? (
            <motion.div
              animate={{ opacity: [0.72, 1, 0.72], scale: [1, 1.04, 1] }}
              transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
              className="badge-lime mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-bold"
            >
              {xpText}
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
