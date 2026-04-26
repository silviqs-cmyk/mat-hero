"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface WeakTopicCardProps {
  topic: string;
  score: number;
  icon?: ReactNode;
  accent?: "pink" | "purple" | "lime";
}

export function WeakTopicCard({
  topic,
  score,
  icon,
  accent = "pink",
}: WeakTopicCardProps) {
  const progressClass = {
    pink: "progress-pink",
    purple: "progress-cyan",
    lime: "progress-lime",
  };

  const ringClass = {
    pink: "border-pink-400/30 text-pink-200",
    purple: "border-cyan-400/30 text-cyan-200",
    lime: "border-lime-300/30 text-lime-200",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(15,11,25,0.98),rgba(10,8,18,0.98))] p-4 text-white shadow-[0_16px_40px_rgba(0,0,0,0.42)]"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white/[0.03] ${ringClass[accent]}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="panel-copy truncate font-medium text-white">{topic}</h3>
            <span className="panel-copy font-semibold text-slate-300">{score}%</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={`h-full rounded-full ${progressClass[accent]}`}
            />
          </div>
        </div>
        <span className="text-slate-500">›</span>
      </div>
    </motion.article>
  );
}
