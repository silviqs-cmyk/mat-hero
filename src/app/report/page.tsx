"use client";

import { AchievementBadge } from "@/components/AchievementBadge";
import { ScoreCard } from "@/components/ScoreCard";
import { WeakTopicCard } from "@/components/WeakTopicCard";
import { useAppState } from "@/components/providers/AppStateProvider";

export default function ReportPage() {
  const { progress } = useAppState();
  const improvement = Math.max(0, progress.last_quiz_score - 55);

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2">
        <ScoreCard title="Подобрение" value={`+${improvement}%`} helper="спрямо старт" accent="lime" />
        <ScoreCard title="Последен тест" value={`${progress.last_quiz_score}%`} helper="резултат" accent="cyan" />
      </section>

      <section className="panel-glow rounded-[28px] p-5">
        <h2 className="font-display text-2xl text-white">Теми за преговор</h2>
        <div className="mt-4 space-y-3">
          {progress.weak_topics.map((topic) => (
            <WeakTopicCard key={topic} topic={topic} score={progress.topic_scores[topic]} />
          ))}
        </div>
      </section>

      <section className="panel-lime rounded-[28px] p-5">
        <h2 className="font-display text-2xl text-white">Какво да направиш утре</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Повтори 2 задачи по {progress.weak_topics[0]?.toLowerCase() ?? "основните теми"},
          после направи един кратък смесен тест. Това държи прогреса стабилен.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AchievementBadge label="XP герой" unlocked={progress.xp >= 200} />
        <AchievementBadge label="3 дни" unlocked={progress.completed_days.length >= 3} />
        <AchievementBadge label="80%+" unlocked={progress.last_quiz_score >= 80} />
      </section>
    </div>
  );
}
