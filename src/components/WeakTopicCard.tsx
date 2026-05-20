"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { NeonCard } from "@/components/ui/NeonCard";
import { formatTopicLabel } from "@/lib/topicLabels";

interface WeakTopicCardProps {
  topic: string;
  score: number;
  icon?: ReactNode;
  accent?: "pink" | "purple" | "lime";
  href?: string;
}

export function WeakTopicCard({
  topic,
  score,
  icon,
  accent = "pink",
  href,
}: WeakTopicCardProps) {
  const progressClass = {
    pink: "mh-progress-fill--pink",
    purple: "mh-progress-fill--cyan",
    lime: "mh-progress-fill--lime",
  };

  const ringClass = {
    pink: "border-pink-400/30 text-pink-200",
    purple: "border-cyan-400/30 text-cyan-200",
    lime: "border-lime-300/30 text-lime-200",
  };

  const card = (
    <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }}>
      <NeonCard as="article" padding="md" className="rounded-[24px] text-white">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-white/[0.03] ${ringClass[accent]}`}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h3 className="truncate text-[1rem] font-medium text-white">{formatTopicLabel(topic)}</h3>
              <span className="text-[0.95rem] font-semibold text-slate-300">{score}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`h-full rounded-full ${progressClass[accent]}`}
              />
            </div>
          </div>
          <span className="text-lg text-slate-500">{href ? ">" : ""}</span>
        </div>
      </NeonCard>
    </motion.article>
  );

  if (!href) {
    return card;
  }

  return <Link href={href}>{card}</Link>;
}
