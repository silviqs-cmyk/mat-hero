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
      <section className="grid grid-cols-2 gap-4">
        <ScoreCard title="Подобрение" value={`+${improvement}%`} helper="Спрямо базовата стартова сесия." />
        <ScoreCard title="Последен куиз" value={`${progress.last_quiz_score}%`} helper="Най-актуалният измерен резултат." />
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-soft">
        <h2 className="font-display text-2xl text-slate-900">Слаби теми за финален преговор</h2>
        <div className="mt-4 space-y-3">
          {progress.weak_topics.map((topic) => (
            <WeakTopicCard
              key={topic}
              topic={topic}
              score={progress.topic_scores[topic]}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[28px] bg-slate-950 p-5 text-white shadow-soft">
        <h2 className="font-display text-2xl">Какво да направиш утре</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Повтори 2 задачи по {progress.weak_topics[0]?.toLowerCase() ?? "основните теми"},
          после направи един смесен мини тест. Така ще затвърдиш точно зоните, които още
          падат под 70%.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <AchievementBadge label="XP герой" unlocked={progress.xp >= 200} />
        <AchievementBadge label="Финиш 3 дни" unlocked={progress.completed_days.length >= 3} />
        <AchievementBadge label="80% резултат" unlocked={progress.last_quiz_score >= 80} />
      </section>
    </div>
  );
}
