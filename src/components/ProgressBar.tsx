"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  helperText?: string;
  accent?: "cyan" | "pink" | "lime" | "purple";
}

export function ProgressBar({
  value,
  max,
  label,
  helperText,
  accent = "cyan",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((value / max) * 100));
  const progressClass = {
    cyan: "progress-cyan",
    pink: "progress-pink",
    lime: "progress-lime",
    purple: "progress-cyan",
  };

  return (
    <div className="panel rounded-[24px] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-sm font-bold text-lime-200">{percentage}%</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full ${progressClass[accent]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        />
      </div>
      {helperText ? <p className="mt-3 text-xs text-[var(--muted)]">{helperText}</p> : null}
    </div>
  );
}
