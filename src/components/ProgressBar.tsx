"use client";

import { motion } from "framer-motion";
import { calculatePercentage } from "@/lib/progress";

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  helperText?: string;
  accent?: "cyan" | "pink" | "lime" | "purple";
  compact?: boolean;
}

const accentClassNames = {
  cyan: "mh-progress-fill--cyan",
  pink: "mh-progress-fill--pink",
  lime: "mh-progress-fill--lime",
  purple: "mh-progress-fill--cyan",
};

export function ProgressBar({
  value,
  max,
  label,
  helperText,
  accent = "cyan",
  compact = false,
}: ProgressBarProps) {
  const percentage = calculatePercentage(value, max);

  return (
    <div className={compact ? "mh-progress" : "mh-card rounded-[26px] p-5"}>
      {!compact ? (
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-[1rem] font-semibold text-white">{label}</p>
          <p className="text-[1rem] font-bold text-cyan-100">{percentage}%</p>
        </div>
      ) : null}

      <div
        className={`${
          compact ? "mh-progress-track mh-progress-track--compact flex-1" : "mh-progress-track mh-progress-track--default"
        }`}
      >
        <motion.div
          className={`h-full rounded-full ${accentClassNames[accent]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        />
      </div>

      {compact ? <p className="text-[2rem] font-semibold text-white">{percentage}%</p> : null}
      {!compact && helperText ? <p className="mt-3 text-[0.95rem] leading-6 text-slate-400">{helperText}</p> : null}
      {compact && label ? <span className="sr-only">{label}</span> : null}
      {compact && helperText ? <span className="sr-only">{helperText}</span> : null}
    </div>
  );
}
