"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface ScoreCardProps {
  title: string;
  value: string;
  helper: string;
  icon?: ReactNode;
  accent?: "cyan" | "pink" | "lime" | "purple" | "orange";
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

export function ScoreCard({
  title,
  value,
  helper,
  icon,
  accent = "cyan",
}: ScoreCardProps) {
  const accentConfig = {
    cyan: {
      iconWrap: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
      helperColor: "text-cyan-300",
    },
    pink: {
      iconWrap: "border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-300",
      helperColor: "text-fuchsia-300",
    },
    lime: {
      iconWrap: "border-lime-400/25 bg-lime-300/10 text-lime-200",
      helperColor: "text-lime-200",
    },
    purple: {
      iconWrap: "border-purple-400/25 bg-purple-400/10 text-purple-300",
      helperColor: "text-purple-300",
    },
    orange: {
      iconWrap: "border-orange-400/25 bg-orange-400/10 text-orange-300",
      helperColor: "text-orange-300",
    },
  };

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(11,15,25,0.98),rgba(7,10,18,0.98))] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.42)]"
    >
      <div className="flex items-start gap-3">
        {icon ? (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${accentConfig[accent].iconWrap}`}
          >
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="panel-copy font-medium text-slate-400">{title}</p>
          <h3 className="mt-2 font-display text-3xl font-bold text-white">{value}</h3>
          <p className={`panel-copy mt-1 ${accentConfig[accent].helperColor}`}>{helper}</p>
        </div>
      </div>
    </motion.article>
  );
}
