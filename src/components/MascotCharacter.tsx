"use client";

import { motion } from "framer-motion";

interface MascotCharacterProps {
  mood?: "idle" | "happy" | "celebrating";
  message: string;
  xpText?: string;
}

export function MascotCharacter({
  mood = "idle",
  message,
  xpText,
}: MascotCharacterProps) {
  const isHappy = mood === "happy" || mood === "celebrating";

  return (
    <div className="panel-glow rounded-[30px] p-5">
      <div className="flex items-center gap-4">
        <motion.div
          animate={
            mood === "celebrating"
              ? { y: [0, -10, 0], scale: [1, 1.06, 1] }
              : isHappy
                ? { y: [0, -5, 0] }
                : { rotate: [0, -2, 2, 0] }
          }
          transition={{
            duration: mood === "celebrating" ? 1.1 : 2.4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="relative h-28 w-24 shrink-0"
        >
          <svg viewBox="0 0 120 150" className="h-full w-full overflow-visible">
            <motion.circle
              cx="60"
              cy="38"
              r="24"
              fill="rgba(57,215,255,0.08)"
              stroke="#d8f9ff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={
                isHappy
                  ? {
                      filter: [
                        "drop-shadow(0 0 0px #39d7ff)",
                        "drop-shadow(0 0 8px #39d7ff)",
                        "drop-shadow(0 0 0px #39d7ff)",
                      ],
                    }
                  : undefined
              }
              transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
            />
            <path
              d="M41 29 Q53 20 79 26"
              stroke="#d8f9ff"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="50" cy="37" r="3.5" fill="#d8f9ff" />
            <circle cx="69" cy="37" r="3.5" fill="#d8f9ff" />
            <path
              d={isHappy ? "M48 49 Q60 59 72 49" : "M49 55 Q60 48 71 55"}
              stroke="#b8ff3b"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <path d="M58 62 L58 97" stroke="#d8f9ff" strokeWidth="5" strokeLinecap="round" />
            <path d="M58 74 L35 92" stroke="#d8f9ff" strokeWidth="5" strokeLinecap="round" />
            <path d="M58 74 L82 88" stroke="#d8f9ff" strokeWidth="5" strokeLinecap="round" />
            <path d="M58 96 L43 127" stroke="#d8f9ff" strokeWidth="5" strokeLinecap="round" />
            <path d="M58 96 L77 126" stroke="#d8f9ff" strokeWidth="5" strokeLinecap="round" />
            {mood === "celebrating" ? (
              <>
                <circle cx="95" cy="26" r="4" fill="#f84ec8" />
                <circle cx="24" cy="30" r="4" fill="#39d7ff" />
                <circle cx="88" cy="53" r="4" fill="#b8ff3b" />
              </>
            ) : null}
          </svg>
        </motion.div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Hero Buddy
          </p>
          <h3 className="mt-2 font-display text-2xl text-white">
            {isHappy ? "Супер ход!" : "Хайде, герой!"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{message}</p>
          {xpText ? (
            <motion.div
              initial={{ opacity: 0.5, scale: 0.96 }}
              animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.04, 1] }}
              transition={{ duration: 1.7, repeat: Number.POSITIVE_INFINITY }}
              className="mt-3 inline-flex rounded-full bg-lime-300/12 px-3 py-1 text-xs font-bold text-lime-200"
            >
              {xpText}
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
