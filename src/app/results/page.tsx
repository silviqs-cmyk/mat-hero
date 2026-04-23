"use client";

import Link from "next/link";
import { AchievementBadge } from "@/components/AchievementBadge";
import { MascotCharacter } from "@/components/MascotCharacter";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreCard } from "@/components/ScoreCard";
import { useAppState } from "@/components/providers/AppStateProvider";

export default function ResultsPage() {
  const { latestResult } = useAppState();

  if (!latestResult) {
    return (
      <div className="panel rounded-[28px] p-5">
        <p className="text-sm text-[var(--text-muted)]">Все още няма завършен куиз.</p>
        <Link
          href="/dashboard"
          className="btn-neon-primary mt-4 inline-flex rounded-full px-5 py-3 text-sm font-semibold"
        >
          Към таблото
        </Link>
      </div>
    );
  }

  const goodScore = latestResult.score >= 70;
  const mistakeCount = latestResult.incorrectQuestionIds.length;

  return (
    <div className="space-y-5">
      <MascotCharacter
        mood={latestResult.score >= 85 ? "celebrating" : goodScore ? "happy" : "idle"}
        message={
          goodScore
            ? "Това беше силен рунд. Натисни нататък и запази темпото."
            : "Имаш ясни места за подобрение. Прегледай грешките и пробвай отново."
        }
        xpText={goodScore ? "+bonus confidence" : "keep going"}
      />

      <section className="grid grid-cols-2 gap-4">
        <ScoreCard
          title="Резултат"
          value={`${latestResult.score}%`}
          helper={`Ден ${latestResult.dayId} · ${latestResult.totalQuestions} въпроса`}
          accent="cyan"
        />
        <ScoreCard
          title="Грешки"
          value={`${mistakeCount}`}
          helper={
            mistakeCount === 0
              ? "Без грешки. Страхотен фокус и увереност."
              : "Точно тук си струва да повториш."
          }
          accent="pink"
        />
      </section>

      <ProgressBar
        label="Точност"
        value={latestResult.score}
        max={100}
        helperText={`Верни отговори: ${latestResult.correctQuestionIds.length}`}
        accent="lime"
      />

      <section className="panel-glow rounded-[28px] p-5">
        <h2 className="font-display text-2xl text-white">Препоръки</h2>
        <div className="mt-4 space-y-3">
          {latestResult.recommendations.map((recommendation) => (
            <p key={recommendation} className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-slate-200">
              {recommendation}
            </p>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <AchievementBadge label="Quiz done" unlocked />
        <AchievementBadge label="70%+" unlocked={goodScore} />
        <AchievementBadge label="Perfect vibe" unlocked={latestResult.score >= 90} />
      </section>

      <div className="flex gap-3">
        <Link
          href="/roadmap"
          className="btn-neon-primary flex-1 rounded-full px-5 py-4 text-center text-sm font-semibold"
        >
          Следващ ден
        </Link>
        <Link
          href="/report"
          className="btn-neon-outline flex-1 rounded-full px-5 py-4 text-center text-sm font-semibold"
        >
          Виж отчет
        </Link>
      </div>
    </div>
  );
}
