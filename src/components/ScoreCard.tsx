"use client";

import { motion } from "framer-motion";

interface ScoreCardProps {
  title: string;
  value: string;
  helper: string;
  accent?: "cyan" | "pink" | "lime";
}

export function ScoreCard({
  title,
  value,
  helper,
  accent = "cyan",
}: ScoreCardProps) {
  const accentClass = {
    cyan: "text-cyan-300 border-cyan-400/20",
    pink: "text-fuchsia-300 border-fuchsia-400/20",
    lime: "text-lime-300 border-lime-400/20",
  };

  return (
    <motion.article
      whileHover={{ y: -3 }}
      className={`rounded-[26px] border bg-[linear-gradient(180deg,rgba(30,34,48,0.96),rgba(19,22,31,0.98))] p-5 shadow-soft ${accentClass[accent]}`}
    >
      <p className="text-sm font-semibold text-[var(--text-muted)]">{title}</p>
      <h3 className="mt-3 font-display text-4xl text-white">{value}</h3>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{helper}</p>
    </motion.article>
  );
}
