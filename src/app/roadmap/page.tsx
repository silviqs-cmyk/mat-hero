"use client";

import { AchievementBadge } from "@/components/AchievementBadge";
import { DayCard } from "@/components/DayCard";
import { useAppState } from "@/components/providers/AppStateProvider";
import { demoDays } from "@/lib/demoData";

export default function RoadmapPage() {
  const { progress, resetProgress } = useAppState();

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
      <section className="panel-glow rounded-[30px] p-5 lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Пътна карта</p>
            <h2 className="mt-2 font-display text-2xl text-white">10 дни до успеха</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              Можеш да се връщаш към вече отключените дни за преговор. Ако искаш
              нов старт, зануляваш прогреса и започваш от Ден 1.
            </p>
          </div>

          <button
            type="button"
            onClick={resetProgress}
            className="btn-neon-outline rounded-2xl px-4 py-3 text-sm font-semibold"
          >
            Започни отначало
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <AchievementBadge label={`${progress.current_day} отключени`} unlocked />
          <AchievementBadge label={`${progress.completed_days.length} завършени`} unlocked />
          <AchievementBadge label="Финален тест" unlocked={progress.current_day >= 10} />
        </div>
      </section>

      {demoDays.map((day) => {
        const isCompleted = progress.completed_days.includes(day.id);
        const isUnlocked = day.id <= progress.current_day || isCompleted;

        return (
          <DayCard
            key={day.id}
            day={{ ...day, is_active: isUnlocked }}
            isCompleted={isCompleted}
            isCurrent={day.id === progress.current_day}
            isUnlocked={isUnlocked}
          />
        );
      })}
    </div>
  );
}
