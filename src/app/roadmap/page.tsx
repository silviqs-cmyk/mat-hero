"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, Zap } from "lucide-react";
import { AchievementBadge } from "@/components/AchievementBadge";
import { DayCard } from "@/components/DayCard";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { resetStudentProgress } from "@/services/resetProgress";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { demoDays } from "@/lib/demoData";

export default function RoadmapPage() {
  const router = useRouter();
  const { progress, resetProgress } = useAppState();
  const { isAuthenticated } = useCurrentUser();
  const [isResetting, setIsResetting] = useState(false);
  const maxUnlockedDay = Math.min(
    10,
    Math.max(progress.current_day, ...progress.completed_days.map((dayId) => dayId + 1)),
  );

  async function handleReset() {
    if (isResetting) {
      return;
    }

    setIsResetting(true);

    try {
      if (isAuthenticated) {
        await resetStudentProgress();
      }

      resetProgress();
      router.refresh();
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="space-y-6">
      <NeonCard padding="md">
        <SectionHeader
          label="Пътна карта"
          title={<h2 className="mh-heading-xl">10 дни до увереност</h2>}
          action={
            <NeonButton type="button" onClick={() => void handleReset()} variant="secondary" className="min-h-0 px-4 py-2 text-sm" disabled={isResetting}>
              {isResetting ? "Зануляване..." : "Рестарт"}
            </NeonButton>
          }
        />
        <p className="mh-copy-muted mt-3 max-w-3xl text-[1rem]">
          Всеки ден отключва следващия. Пази ритъма, мини през урока, задачите и теста и ще виждаш как целият план се затваря стъпка по стъпка.
        </p>
      </NeonCard>

      <section className="grid gap-4 lg:grid-cols-3">
        <NeonCard padding="sm" className="rounded-[26px]">
          <StatCard icon={Zap} value={progress.current_day} label="Текущ ден" tone="cyan" />
        </NeonCard>

        <NeonCard padding="sm" className="rounded-[26px]">
          <StatCard icon={Target} value={`${progress.completed_days.length}/10`} label="Завършени дни" tone="gold" />
        </NeonCard>

        <NeonCard padding="sm" className="rounded-[26px]">
          <p className="text-sm text-slate-400">Планът ти</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <AchievementBadge label={`Ден ${progress.current_day}`} unlocked />
            <AchievementBadge label={`${progress.completed_days.length} готови`} unlocked />
            <AchievementBadge label="Финал" unlocked={progress.current_day >= 10} />
          </div>
        </NeonCard>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {demoDays.map((day) => {
          const isCompleted = progress.completed_days.includes(day.id);
          const isCurrent = day.id === progress.current_day;
          const isUnlocked = day.id <= maxUnlockedDay || isCurrent || isCompleted;

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
