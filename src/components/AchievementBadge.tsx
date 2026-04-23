"use client";

import { motion } from "framer-motion";

interface AchievementBadgeProps {
  label: string;
  unlocked: boolean;
}

export function AchievementBadge({ label, unlocked }: AchievementBadgeProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className={`rounded-2xl border px-4 py-3 text-center text-sm font-semibold ${
        unlocked
          ? "border-lime-300/30 bg-lime-300/10 text-lime-200 shadow-[0_0_24px_rgba(184,255,59,0.12)]"
          : "border-white/8 bg-white/5 text-slate-500"
      }`}
    >
      {label}
    </motion.div>
  );
}
