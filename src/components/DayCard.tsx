"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { NeonCard } from "@/components/ui/NeonCard";
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
      <Link href={isUnlocked ? `/lesson/${day.id}` : "/roadmap"} className="block">
        <NeonCard
          as="article"
          tone={isCurrent ? "cyan" : "default"}
          padding="sm"
          className={`rounded-[24px] transition ${!isUnlocked && !isCompleted ? "opacity-70" : ""}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-xl font-black text-white">Ден {day.order_index}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--mh-text-muted)]">{day.topic}</p>
            </div>
            <Badge tone={isUnlocked || isCompleted ? "cyan" : "neutral"}>{statusLabel}</Badge>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                isUnlocked || isCompleted
                  ? "border-lime-300/28 bg-lime-300/10 text-lime-100"
                  : "border-white/12 text-slate-500"
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
            <div className="mh-progress-track mh-progress-track--default">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressValue}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  isCompleted ? "mh-progress-fill--cyan" : isCurrent ? "mh-progress-fill--lime" : "bg-white/0"
                }`}
              />
            </div>
          </div>
        </NeonCard>
      </Link>
    </motion.div>
  );
}
