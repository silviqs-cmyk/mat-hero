"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Day } from "@/types";

interface DayCardProps {
  day: Day;
  isCompleted: boolean;
  isCurrent: boolean;
  isUnlocked?: boolean;
}

export function DayCard({
  day,
  isCompleted,
  isCurrent,
  isUnlocked = day.is_active,
}: DayCardProps) {
  const progressValue = isCompleted ? 100 : isCurrent ? 40 : 0;
  const statusLabel = isCompleted
    ? "Завършен"
    : isCurrent
      ? "Днес"
      : isUnlocked
        ? "Активен"
        : "Заключен";

  return (
    <motion.div whileHover={isUnlocked ? { y: -3 } : undefined} whileTap={{ scale: 0.98 }}>
      <Link
        href={isUnlocked ? `/lesson/${day.id}` : "/roadmap"}
        className={`block rounded-[24px] border p-4 transition ${
          isCurrent
            ? "panel-lime"
            : isCompleted || isUnlocked
              ? "panel-glow"
              : "border-white/10 bg-white/[0.03] opacity-70"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-xl font-black text-white">Ден {day.order_index}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{day.topic}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isUnlocked || isCompleted
                ? "badge-cyan"
                : "border border-white/10 bg-white/5 text-slate-500"
            }`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
              isUnlocked || isCompleted ? "badge-lime" : "border-white/12 text-slate-500"
            }`}
          >
            {day.order_index}
          </div>
          <p className="text-sm text-slate-200">{day.title}</p>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">Прогрес за деня</span>
            <span className={progressValue > 0 ? "text-lime-200" : "text-slate-500"}>
              {progressValue}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressValue}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${
                isCompleted ? "progress-cyan" : isCurrent ? "progress-lime" : "bg-white/0"
              }`}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
