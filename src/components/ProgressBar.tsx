"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  helperText?: string;
  accent?: "cyan" | "pink" | "lime";
}

export function ProgressBar({
  value,
  max,
  label,
  helperText,
  accent = "cyan",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((value / max) * 100));
  const gradients = {
    cyan: "from-cyan-400 via-sky-400 to-indigo-400",
    pink: "from-fuchsia-500 via-pink-400 to-cyan-400",
    lime: "from-lime-300 via-cyan-300 to-sky-400",
  };

  return (
    <div className="panel-glow rounded-[28px] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-sm font-bold text-cyan-300">{percentage}%</p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/8">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${gradients[accent]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <motion.div
        className="mt-2 h-1 w-10 rounded-full bg-cyan-300/60"
        animate={{ x: [0, 80, 0], opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      {helperText ? <p className="mt-3 text-xs text-[var(--text-muted)]">{helperText}</p> : null}
    </div>
  );
}
