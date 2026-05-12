"use client";

import { motion, type Transition } from "framer-motion";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";

interface FeedbackMascotProps {
  state: "correct" | "incorrect" | "completed";
  size?: "sm" | "md" | "lg";
}

const containerClassNames = {
  sm: "h-32 w-32",
  md: "h-40 w-40",
  lg: "h-52 w-52",
};

const glowClassNames = {
  correct:
    "bg-[radial-gradient(circle,rgba(34,211,238,0.28)_0%,rgba(16,185,129,0.18)_42%,rgba(0,0,0,0)_72%)]",
  incorrect:
    "bg-[radial-gradient(circle,rgba(251,191,36,0.24)_0%,rgba(244,114,182,0.18)_42%,rgba(0,0,0,0)_72%)]",
  completed:
    "bg-[radial-gradient(circle,rgba(34,211,238,0.3)_0%,rgba(132,204,22,0.2)_30%,rgba(244,114,182,0.18)_52%,rgba(0,0,0,0)_74%)]",
};

function FloatingAccents({ state }: Pick<FeedbackMascotProps, "state">) {
  if (state === "incorrect") {
    return (
      <>
        <motion.span
          className="absolute left-1 top-4 text-lg font-bold text-amber-200"
          animate={{ y: [0, -5, 0], opacity: [0.55, 1, 0.55], rotate: [0, -6, 0] }}
          transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" as const }}
        >
          ?
        </motion.span>
        <motion.span
          className="absolute right-1 top-7 text-sm font-bold text-pink-200"
          animate={{ y: [0, -4, 0], opacity: [0.45, 0.95, 0.45], rotate: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" as const, delay: 0.15 }}
        >
          ?
        </motion.span>
      </>
    );
  }

  if (state === "completed") {
    return (
      <>
        {[
          "left-2 top-5 bg-cyan-300",
          "right-3 top-4 bg-lime-300",
          "left-6 bottom-7 bg-pink-300",
          "right-6 bottom-6 bg-amber-200",
          "left-1/2 top-2 bg-white",
        ].map((className, index) => (
          <motion.span
            key={className}
            className={`absolute h-2.5 w-2.5 rounded-full ${className}`}
            animate={{
              y: [0, -10 - index * 2, 0],
              x: [0, index % 2 === 0 ? -4 : 4, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.9, 1.15, 0.9],
            }}
            transition={{
              duration: 1.2 + index * 0.12,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut" as const,
              delay: index * 0.08,
            }}
          />
        ))}
      </>
    );
  }

  return (
    <>
      <motion.span
        className="absolute left-3 top-5 text-base text-cyan-200"
        animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" as const }}
      >
        *
      </motion.span>
      <motion.span
        className="absolute right-2 top-6 text-xl text-emerald-200"
        animate={{ y: [0, -7, 0], opacity: [0.35, 0.95, 0.35], rotate: [0, 8, 0] }}
        transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" as const, delay: 0.12 }}
      >
        +
      </motion.span>
    </>
  );
}

export function FeedbackMascot({ state, size = "md" }: FeedbackMascotProps) {
  const animation =
    state === "completed"
      ? { y: [0, -9, 0], scale: [1, 1.06, 1], rotate: [0, -1.2, 1.2, 0] }
      : state === "correct"
        ? { y: [0, -6, 0], scale: [1, 1.03, 1], rotate: [0, -0.6, 0.6, 0] }
        : { y: [0, -2, 0], rotate: [0, -2.2, 2.2, -1.6, 1.6, 0], scale: [1, 0.99, 1] };

  const transition: Transition =
    state === "incorrect"
      ? { duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
      : { duration: state === "completed" ? 1.1 : 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" };

  return (
    <div className="flex justify-center">
      <div className={`relative ${containerClassNames[size]}`}>
        <motion.div
          className={`absolute inset-[-18%] rounded-full blur-2xl ${glowClassNames[state]}`}
          animate={{ opacity: [0.55, 1, 0.55], scale: [0.95, 1.04, 0.95] }}
          transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <FloatingAccents state={state} />
        <motion.div
          className="relative z-10"
          animate={animation}
          transition={transition}
        >
          <AnimatedHeroMascot size={size} animated={false} />
        </motion.div>
      </div>
    </div>
  );
}
