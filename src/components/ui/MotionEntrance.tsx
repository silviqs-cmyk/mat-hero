"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface MotionEntranceProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  axis?: "x" | "y";
}

export function MotionEntrance({
  children,
  className,
  delay = 0,
  duration = 0.28,
  distance = 12,
  axis = "y",
}: MotionEntranceProps) {
  const prefersReducedMotion = useReducedMotion();
  const initial =
    prefersReducedMotion
      ? { opacity: 1 }
      : axis === "x"
        ? { opacity: 0, x: distance }
        : { opacity: 0, y: distance };
  const animate = prefersReducedMotion
    ? { opacity: 1 }
    : axis === "x"
      ? { opacity: 1, x: 0 }
      : { opacity: 1, y: 0 };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={prefersReducedMotion ? { duration: 0 } : { duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
