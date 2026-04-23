"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Day } from "@/types";

interface DayCardProps {
  day: Day;
  isCompleted: boolean;
  isCurrent: boolean;
}

export function DayCard({ day, isCompleted, isCurrent }: DayCardProps) {
  const statusLabel = isCompleted
    ? "Завършен"
    : isCurrent
      ? "Днес"
      : day.is_active
        ? "Активен"
        : "Заключен";

  return (
    <motion.div whileHover={day.is_active ? { y: -4 } : undefined} whileTap={{ scale: 0.985 }}>
      <Link
        href={day.is_active ? `/lesson/${day.id}` : "/roadmap"}
        className={`block rounded-[28px] border p-5 transition ${
          day.is_active
            ? "border-cyan-400/25 bg-[linear-gradient(180deg,rgba(33,37,56,0.98),rgba(20,23,34,0.98))] shadow-[0_0_24px_rgba(57,215,255,0.14)]"
            : "border-white/8 bg-[rgba(25,29,41,0.78)] opacity-80"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Ден {day.order_index}
            </p>
            <h3 className="mt-2 font-display text-xl text-white">{day.topic}</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{day.title}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isCompleted
                ? "bg-emerald-400/15 text-emerald-300"
                : isCurrent
                  ? "bg-fuchsia-400/15 text-fuchsia-300"
                  : day.is_active
                    ? "bg-cyan-400/15 text-cyan-300"
                    : "bg-white/8 text-slate-400"
            }`}
          >
            {statusLabel}
          </span>
        </div>
        {!day.is_active ? (
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-slate-500" />
            Отключва се след предишните мисии
          </div>
        ) : null}
      </Link>
    </motion.div>
  );
}
