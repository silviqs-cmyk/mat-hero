"use client";

import { motion } from "framer-motion";
import { NeonCard } from "@/components/ui/NeonCard";

interface AchievementBadgeProps {
  label: string;
  unlocked: boolean;
}

export function AchievementBadge({ label, unlocked }: AchievementBadgeProps) {
  return (
    <motion.div whileHover={{ y: -2, scale: 1.01 }}>
      <NeonCard
        as="div"
        tone={unlocked ? "green" : "muted"}
        padding="sm"
        className={`rounded-[20px] px-4 py-3 text-center text-sm font-semibold ${
          unlocked ? "text-lime-100" : "text-slate-500"
        }`}
      >
        {label}
      </NeonCard>
    </motion.div>
  );
}
