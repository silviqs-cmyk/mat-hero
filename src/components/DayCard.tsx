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
  const statusLabel = isCompleted
    ? "Завършен"
    : isCurrent
      ? "Днес"
      : isUnlocked
        ? "Достъпен"
        : "Заключен";

  return (
    <motion.div whileHover={isUnlocked ? { y: -3 } : undefined} whileTap={{ scale: 0.98 }}>
      <Link
        href={isUnlocked ? `/lesson/${day.id}` : "/roadmap"}
        className={`block rounded-[24px] border p-4 transition ${
          isCurrent
            ? "panel-lime"
            : isUnlocked
              ? "panel-glow"
              : "border-white/10 bg-white/[0.03] opacity-70"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
              isUnlocked ? "badge-lime" : "border-white/12 text-slate-500"
            }`}
          >
            {day.order_index}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-bold text-white">{day.topic}</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">{day.title}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isUnlocked ? "badge-cyan" : "border border-white/10 bg-white/5 text-slate-500"
            }`}
          >
            {statusLabel}
          </span>
        </div>

        {!isUnlocked ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-slate-600" />
            Отключва се след предишните мисии
          </div>
        ) : isCompleted ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-lime-200">
            <span className="inline-block h-2 w-2 rounded-full bg-lime-300" />
            Можеш да се върнеш и да преговориш темата по всяко време
          </div>
        ) : null}
      </Link>
    </motion.div>
  );
}
