"use client";

import { Star, Target, TriangleAlert } from "lucide-react";
import { AchievementBadge } from "@/components/AchievementBadge";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreCard } from "@/components/ScoreCard";
import { useAppState } from "@/components/providers/AppStateProvider";
import { Badge } from "@/components/ui/Badge";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { dayTaskData } from "@/lib/dayTaskData";

export default function ResultsPage() {
  const { latestResult, progress } = useAppState();

  if (!latestResult) {
    return (
      <NeonCard padding="md">
        <p className="mh-copy-muted">Все още няма завършен тест.</p>
        <NeonButton href="/dashboard" variant="secondary" className="mt-4">
          Към таблото
        </NeonButton>
      </NeonCard>
    );
  }

  const goodScore = latestResult.score >= 70;
  const mistakeCount = latestResult.incorrectQuestionIds.length;
  const hasExtraTasks = (dayTaskData[latestResult.dayId]?.extra.length ?? 0) > 0;
  const completedMainQuiz = latestResult.mode === "main";
  const lessonReviewHref = `/lesson/${latestResult.dayId}`;
  const earnedXp = latestResult.score + (completedMainQuiz ? 25 : 15);
  const nextDayId =
    completedMainQuiz && progress.current_day > latestResult.dayId
      ? progress.current_day
      : Math.min(10, latestResult.dayId + 1);
  const nextDayHref = `/lesson/${nextDayId}`;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <NeonCard padding="md">
          <SectionHeader
            label={completedMainQuiz ? "Резултат от теста" : "Резултат от бонус тренировка"}
            title={<h1 className="mh-heading-xl">{goodScore ? "Страхотна работа!" : "Продължавай смело!"}</h1>}
            action={<Badge tone="green">{completedMainQuiz ? "основен пакет" : "бонус пакет"}</Badge>}
          />
          <p className="mh-copy-muted mt-3 max-w-3xl text-[1rem]">
            {goodScore
              ? "Поддържаш добро темпо. Използвай следващите задачи, за да затвърдиш ритъма."
              : "Вече е ясно къде да натиснем още малко. Това е най-полезната част от тренировката."}
          </p>
        </NeonCard>

        <NeonCard padding="md">
          <div className="flex justify-center">
            <AnimatedHeroMascot size="md" animated={false} />
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-lime-100">
            <Star className="h-4 w-4" />
            <span className="text-sm font-semibold">+{earnedXp} XP от този рунд</span>
          </div>
        </NeonCard>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <ScoreCard title="Резултат" value={`${latestResult.score}%`} helper={`Ден ${latestResult.dayId}`} accent="cyan" icon={<Target className="h-5 w-5" />} />
        <ScoreCard title="Грешки" value={`${mistakeCount}`} helper={mistakeCount === 0 ? "Без грешки" : "Тук си струва повторение"} accent="pink" icon={<TriangleAlert className="h-5 w-5" />} />
        <ScoreCard title="XP" value={`+${earnedXp}`} helper={`Общо XP: ${progress.xp}`} accent="lime" icon={<Star className="h-5 w-5" />} />
      </section>

      <ProgressBar
        label="Точност"
        value={latestResult.score}
        max={100}
        helperText={`Верни отговори: ${latestResult.correctQuestionIds.length}`}
        accent="lime"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <NeonCard padding="md">
          <h2 className="mh-heading-lg">Препоръки</h2>
          <div className="mt-5 space-y-3">
            {latestResult.recommendations.map((recommendation) => (
              <p key={recommendation} className="rounded-[24px] border border-white/8 bg-white/5 p-5 text-[1rem] leading-7 text-slate-200">
                {recommendation}
              </p>
            ))}
            <NeonButton href={lessonReviewHref} variant="secondary" className="mt-2">
              Върни се към урока
            </NeonButton>
          </div>
        </NeonCard>

        <NeonCard padding="sm" className="rounded-[26px]">
          <p className="text-sm text-slate-400">Баджове</p>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <AchievementBadge label="Тест готов" unlocked />
            <AchievementBadge label="70%+" unlocked={goodScore} />
            <AchievementBadge label="90%+" unlocked={latestResult.score >= 90} />
          </div>
        </NeonCard>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        {completedMainQuiz ? (
          <NeonButton href={nextDayHref} className="flex-1">
            {nextDayId > latestResult.dayId ? `Към ден ${nextDayId}` : "Следващ ден"}
          </NeonButton>
        ) : (
          <NeonButton href="/roadmap" className="flex-1">
            Следващ ден
          </NeonButton>
        )}
        {completedMainQuiz && hasExtraTasks ? (
          <NeonButton href={`/quiz/${latestResult.dayId}?mode=extra`} variant="secondary" className="flex-1">
            Бонус задачи
          </NeonButton>
        ) : null}
        <NeonButton href="/report" variant="ghost" className="flex-1">
          Отчет
        </NeonButton>
      </div>
    </div>
  );
}
