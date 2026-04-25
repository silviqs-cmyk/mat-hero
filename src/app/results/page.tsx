"use client";

import Link from "next/link";
import { AchievementBadge } from "@/components/AchievementBadge";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreCard } from "@/components/ScoreCard";
import { useAppState } from "@/components/providers/AppStateProvider";
import { dayTaskData } from "@/lib/dayTaskData";

export default function ResultsPage() {
  const { latestResult } = useAppState();

  if (!latestResult) {
    return (
      <div className="panel rounded-[28px] p-5">
        <p className="text-sm text-[var(--muted)]">Все още няма завършен тест.</p>
        <Link
          href="/dashboard"
          className="btn-neon-primary mt-4 inline-flex rounded-2xl px-5 py-3 text-sm font-semibold"
        >
          Към таблото
        </Link>
      </div>
    );
  }

  const goodScore = latestResult.score >= 70;
  const mistakeCount = latestResult.incorrectQuestionIds.length;
  const hasExtraTasks = (dayTaskData[latestResult.dayId]?.extra.length ?? 0) > 0;
  const completedMainQuiz = latestResult.mode === "main";

  return (
    <div className="space-y-5 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-5 lg:space-y-0">
      <section className="panel-glow rounded-[30px] p-5">
        <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              {completedMainQuiz ? "Резултат от теста" : "Резултат от бонус тренировка"}
            </p>
            <h3 className="mt-2 font-display text-2xl text-white">
              {goodScore ? "Страхотна работа!" : "Продължавай смело!"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {goodScore
                ? "Поддържаш добро темпо. Използвай и следващите задачи, за да го затвърдиш."
                : "Вече е ясно къде да натиснем още малко. Това е най-полезната част от тренировката."}
            </p>
            <div className="badge-lime mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-bold">
              {completedMainQuiz ? "основен пакет" : "бонус пакет"}
            </div>
          </div>
          <AnimatedHeroMascot size="sm" animated={false} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <ScoreCard
          title="Резултат"
          value={`${latestResult.score}%`}
          helper={`Ден ${latestResult.dayId}`}
          accent="cyan"
        />
        <ScoreCard
          title="Грешки"
          value={`${mistakeCount}`}
          helper={
            mistakeCount === 0
              ? "Без грешки. Страхотен фокус."
              : "Тук си струва да повториш."
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

      <section className="panel-glow rounded-[28px] p-5 lg:row-span-2">
        <h2 className="font-display text-2xl text-white">Препоръки</h2>
        <div className="mt-4 space-y-3">
          {latestResult.recommendations.map((recommendation) => (
            <p
              key={recommendation}
              className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-slate-200"
            >
              {recommendation}
            </p>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AchievementBadge label="Тест готов" unlocked />
        <AchievementBadge label="70%+" unlocked={goodScore} />
        <AchievementBadge label="90%+" unlocked={latestResult.score >= 90} />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
        {completedMainQuiz && hasExtraTasks ? (
          <Link
            href={`/quiz/${latestResult.dayId}?mode=extra`}
            className="btn-neon-primary flex-1 rounded-2xl px-5 py-4 text-center text-sm font-semibold"
          >
            Бонус задачи
          </Link>
        ) : (
          <Link
            href="/roadmap"
            className="btn-neon-primary flex-1 rounded-2xl px-5 py-4 text-center text-sm font-semibold"
          >
            Следващ ден
          </Link>
        )}
        <Link
          href="/report"
          className="btn-neon-outline flex-1 rounded-2xl px-5 py-4 text-center text-sm font-semibold"
        >
          Отчет
        </Link>
      </div>
    </div>
  );
}
