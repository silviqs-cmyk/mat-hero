"use client";

import Link from "next/link";
import { AchievementBadge } from "@/components/AchievementBadge";
import { MascotCharacter } from "@/components/MascotCharacter";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreCard } from "@/components/ScoreCard";
import { WeakTopicCard } from "@/components/WeakTopicCard";
import { useAppState } from "@/components/providers/AppStateProvider";

export default function DashboardPage() {
  const { progress } = useAppState();
  const currentProgress = progress.current_day - 1;
  const mascotMood = progress.last_quiz_score >= 80 ? "celebrating" : "happy";

  return (
    <div className="space-y-5">
      <section className="rounded-[32px] border border-cyan-400/18 bg-[radial-gradient(circle_at_top_left,rgba(57,215,255,0.18),transparent_30%),linear-gradient(135deg,rgba(27,31,45,0.98),rgba(20,23,34,0.98)_50%,rgba(51,24,68,0.9))] p-5 text-white shadow-[0_0_32px_rgba(57,215,255,0.12)]">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Днешен фокус</p>
        <h2 className="mt-3 font-display text-3xl">Ден {progress.current_day}</h2>
        <p className="mt-2 text-sm text-slate-300">
          Продължи с кратък урок, реши куиза и вдигни streak-а си с още една мисия.
        </p>
        <Link
          href={`/lesson/${progress.current_day}`}
          className="btn-neon-primary mt-5 inline-flex rounded-full px-5 py-3 text-sm font-semibold transition"
        >
          Продължи към урока
        </Link>
      </section>

      <MascotCharacter
        mood={mascotMood}
        message="Всеки ден носи XP. Ако направиш добър резултат, аз се усмихвам още по-широко."
        xpText={`+${progress.xp} XP общо`}
      />

      <section className="grid grid-cols-2 gap-4">
        <ScoreCard title="XP" value={`${progress.xp}`} helper="Трупаш точки след всеки куиз." accent="cyan" />
        <ScoreCard
          title="Streak"
          value={`${progress.streak} дни`}
          helper="Реши днешната мисия, за да не го прекъснеш."
          accent="pink"
        />
      </section>

      <section className="grid grid-cols-2 gap-4">
        <ScoreCard
          title="Current Day"
          value={`#${progress.current_day}`}
          helper="Текущата отключена мисия."
          accent="lime"
        />
        <ScoreCard
          title="Last Score"
          value={`${progress.last_quiz_score}%`}
          helper="Последният измерен резултат."
          accent="cyan"
        />
      </section>

      <ProgressBar
        label="10-дневен прогрес"
        value={currentProgress}
        max={10}
        helperText={`${progress.completed_days.length} завършени дни до момента`}
        accent="pink"
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl text-white">Слаби теми</h3>
          <Link href="/report" className="text-sm font-semibold text-cyan-300">
            Виж отчет
          </Link>
        </div>
        {progress.weak_topics.map((topic) => (
          <WeakTopicCard key={topic} topic={topic} score={progress.topic_scores[topic]} />
        ))}
      </section>

      <section className="grid grid-cols-3 gap-3">
        <AchievementBadge label="Първи куиз" unlocked={progress.completed_days.length > 0} />
        <AchievementBadge label="100 XP" unlocked={progress.xp >= 100} />
        <AchievementBadge label="3 дни streak" unlocked={progress.streak >= 3} />
      </section>
    </div>
  );
}
