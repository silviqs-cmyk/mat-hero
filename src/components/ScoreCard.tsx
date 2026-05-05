"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { NeonCard } from "@/components/ui/NeonCard";

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
      iconWrap: "border-cyan-400/28 bg-cyan-400/12 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.16)]",
      helperColor: "text-cyan-200/90",
      edgeGlow: "before:bg-cyan-400/25",
    },
    pink: {
      iconWrap: "border-fuchsia-400/28 bg-fuchsia-400/12 text-fuchsia-200 shadow-[0_0_24px_rgba(217,70,239,0.16)]",
      helperColor: "text-fuchsia-200/90",
      edgeGlow: "before:bg-fuchsia-400/25",
    },
    lime: {
      iconWrap: "border-lime-400/28 bg-lime-300/10 text-lime-100 shadow-[0_0_24px_rgba(163,230,53,0.14)]",
      helperColor: "text-lime-100/90",
      edgeGlow: "before:bg-lime-300/25",
    },
    purple: {
      iconWrap: "border-violet-400/28 bg-violet-400/12 text-violet-200 shadow-[0_0_24px_rgba(167,139,250,0.16)]",
      helperColor: "text-violet-200/90",
      edgeGlow: "before:bg-violet-400/25",
    },
    orange: {
      iconWrap: "border-amber-400/28 bg-amber-400/12 text-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.16)]",
      helperColor: "text-amber-200/90",
      edgeGlow: "before:bg-amber-400/25",
    },
  };

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <NeonCard
        as="article"
        padding="sm"
        className={`relative overflow-hidden rounded-[24px] before:absolute before:left-0 before:top-0 before:h-full before:w-px ${accentConfig[accent].edgeGlow}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_26%)]" />
        <div className="flex items-start gap-3">
          {icon ? (
            <div
              className={`relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${accentConfig[accent].iconWrap}`}
            >
              {icon}
            </div>
          ) : null}
          <div className="relative z-[1] min-w-0">
            <p className="text-[0.95rem] font-medium text-slate-400">{title}</p>
            <h3 className="mt-2 font-display text-[2rem] font-bold leading-none text-white">{value}</h3>
            <p className={`mt-2 text-[0.95rem] leading-6 ${accentConfig[accent].helperColor}`}>{helper}</p>
          </div>
        </div>
      </NeonCard>
    </motion.article>
  );
}
