"use client";

import { motion } from "framer-motion";

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
          className="h-28 w-24 shrink-0"
        >
          <svg viewBox="0 0 120 150" className="h-full w-full overflow-visible">
            <defs>
              <filter id="mascotGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {isCheering ? (
              <>
                <motion.path
                  d="M18 25 L25 17 M21 34 L31 34"
                  stroke="#c9ff00"
                  strokeWidth="3"
                  strokeLinecap="round"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.7, repeat: Number.POSITIVE_INFINITY }}
                />
                <motion.path
                  d="M96 22 L103 14 M91 34 L102 36"
                  stroke="#ff4ed1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.7, repeat: Number.POSITIVE_INFINITY, delay: 0.15 }}
                />
              </>
            ) : null}
            <motion.circle
              cx="60"
              cy="38"
              r="24"
              fill="rgba(37,221,255,0.04)"
              stroke="#8ff4ff"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#mascotGlow)"
              animate={isHappy ? { scale: [1, 1.04, 1] } : undefined}
              transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
            />
            <path
              d="M39 24 Q56 12 81 25"
              stroke="#b65cff"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.95"
            />
            <circle cx="50" cy="37" r="3.6" fill="#8ff4ff" />
            <circle cx="70" cy="37" r="3.6" fill="#8ff4ff" />
            <path
              d={isHappy ? "M47 49 Q60 60 73 49" : "M49 54 Q60 49 71 54"}
              stroke="#c9ff00"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            <path d="M59 63 L59 97" stroke="#8ff4ff" strokeWidth="4.5" strokeLinecap="round" />
            <motion.path
              d={isCheering ? "M58 73 L34 54" : "M58 73 L34 90"}
              stroke="#8ff4ff"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <motion.path
              d={isCheering ? "M60 73 L88 53" : "M60 73 L88 88"}
              stroke="#8ff4ff"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path d="M59 96 L43 128" stroke="#8ff4ff" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M59 96 L78 126" stroke="#8ff4ff" strokeWidth="4.5" strokeLinecap="round" />
          </svg>
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
