"use client";

import { AchievementBadge } from "@/components/AchievementBadge";
import { DayCard } from "@/components/DayCard";
import { useAppState } from "@/components/providers/AppStateProvider";
import { demoDays } from "@/lib/demoData";

export default function RoadmapPage() {
  const { progress, resetProgress } = useAppState();

  return (
    <div className="space-y-4">
      <section className="panel-glow rounded-[30px] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Пътна карта</p>
            <h2 className="mt-2 font-display text-2xl text-white">10 дни до успеха</h2>
          </div>
          <button
            type="button"
            onClick={resetProgress}
            className="btn-neon-outline rounded-2xl px-3 py-2 text-xs font-semibold"
          >
            Рестарт
          </button>
        </div>
      </section>

      <section className="panel-glow rounded-[30px] p-5">
        <h2 className="font-display text-2xl text-white">План ти за този цикъл</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Всеки следващ ден се отключва едва след като завършиш текущия. Предишните
          дни остават видими като завършени и можеш да се върнеш към тях за
          преговор.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <AchievementBadge label={`Ден ${progress.current_day}`} unlocked />
          <AchievementBadge label={`${progress.completed_days.length} завършени`} unlocked />
          <AchievementBadge label="Финален тест" unlocked={progress.current_day >= 10} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 lg:gap-4">
        {demoDays.map((day) => {
          const isCompleted = progress.completed_days.includes(day.id);
          const isCurrent = day.id === progress.current_day;
          const isUnlocked = isCurrent || isCompleted;

          return (
            <DayCard
              key={day.id}
              day={{ ...day, is_active: isUnlocked }}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isUnlocked={isUnlocked}
            />
          );
        })}
      </section>
    </div>
  );
}
