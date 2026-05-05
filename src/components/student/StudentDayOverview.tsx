"use client";

import { BookOpenCheck, ChevronRight, Flame, Lightbulb, Play, Star } from "lucide-react";
import { DayPlanCard } from "@/components/dashboard/DayPlanCard";
import { DayTimeline } from "@/components/dashboard/DayTimeline";
import { GoalProgressCard } from "@/components/dashboard/GoalProgressCard";
import { HeroBuddyCard } from "@/components/dashboard/HeroBuddyCard";
import { InfoCard } from "@/components/dashboard/InfoCard";
import { LearningOutcomes } from "@/components/dashboard/LearningOutcomes";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  buildLessonHref,
  buildVideoHref,
  getDashboardProgress,
  getGoalModel,
  getHeroBuddy,
  getLearningOutcomes,
  getLessonBlocks,
  getPlanSteps,
  mapTimeline,
} from "@/lib/studentFlow";
import type { CourseWithDays, DayContentBundle } from "@/types/course";
import type { UserProfile, UserProgress } from "@/types/user";

interface StudentDayOverviewProps {
  course: CourseWithDays;
  bundle: DayContentBundle;
  progress: UserProgress | null;
  profile: UserProfile | null;
}

export function StudentDayOverview({ course, bundle, progress, profile }: StudentDayOverviewProps) {
  const progressValue = getDashboardProgress(progress, course.duration_days);
  const timeline = mapTimeline(course.days, course.slug, bundle.day.day_number);
  const lessonBlocks = getLessonBlocks(bundle);
  const planSteps = getPlanSteps(bundle, course.slug);
  const outcomes = getLearningOutcomes(bundle);
  const heroBuddy = getHeroBuddy(bundle);
  const goal = getGoalModel(profile);
  const lessonHref = buildLessonHref(course.slug, bundle.day.day_number);
  const videoDuration = bundle.lessons[0]?.estimated_minutes
    ? `${bundle.lessons[0].estimated_minutes}:00 мин`
    : "5:00 мин";
  const daySummary =
    bundle.day.subtitle && !/^Раздел\s+\d+(\s+и\s+Раздел\s+\d+)?$/i.test(bundle.day.subtitle.trim())
      ? bundle.day.subtitle
      : bundle.day.description;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DayPlanCard badge="" title="Как да минеш урока без хаос" steps={planSteps} />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <NeonCard padding="md">
          <SectionHeader
            label={`Ден ${bundle.day.day_number} от ${course.duration_days}`}
            title={<h1 className="mh-heading-xl">{bundle.day.title}</h1>}
            action={<Badge tone="cyan">{progressValue}% готово</Badge>}
          />
          <p className="mh-copy-muted mt-3 max-w-3xl text-[1rem]">{daySummary}</p>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <InfoCard label="Теория" tone="purple" icon={<BookOpenCheck className="h-5 w-5 text-fuchsia-200" />}>
              <p>{daySummary}</p>
            </InfoCard>

            <InfoCard label="Пример" tone="purple" icon={<BookOpenCheck className="h-5 w-5 text-fuchsia-200" />}>
              {lessonBlocks.example.split("\n").map((line) => (
                <p key={line}>{line}</p>
              ))}
            </InfoCard>

            <div className="xl:col-span-2">
              <InfoCard label="Най-важното" tone="cyan" icon={<Lightbulb className="h-5 w-5 text-cyan-200" />}>
                <p>{lessonBlocks.keyPoints}</p>
              </InfoCard>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 2xl:flex-row">
            <NeonButton
              href={buildVideoHref(course.slug, bundle.day.day_number)}
              variant="secondary"
              className="min-h-14 w-full px-6 text-[1.1rem] 2xl:w-auto"
            >
              <Play className="h-5 w-5" />
              Виж видео ({videoDuration})
            </NeonButton>

            <NeonButton href={lessonHref} className="min-h-14 w-full px-8 text-[1.15rem] 2xl:flex-1">
              Започни урока
              <ChevronRight className="h-5 w-5" />
            </NeonButton>
          </div>

          <div className="mt-6">
            <ProgressBar
              value={progressValue}
              max={100}
              label="Напредък в плана"
              helperText="Всеки ден е ясен маршрут: теория, кратко видео, задачи и тест."
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <NeonCard padding="sm" className="rounded-[26px]">
              <StatCard icon={Flame} value={progress?.streak_days ?? 0} label="Поредни дни" tone="gold" />
            </NeonCard>
            <NeonCard padding="sm" className="rounded-[26px]">
              <StatCard icon={Star} value={progress?.total_xp ?? 0} label="XP точки" tone="cyan" />
            </NeonCard>
          </div>
        </NeonCard>

        <NeonCard padding="md">
          <SectionHeader label="План за 10 дни" title={<h2 className="mh-heading-lg">Твоят план</h2>} />
          <DayTimeline items={timeline} />
        </NeonCard>
      </section>

      <HeroBuddyCard buddy={heroBuddy} />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <LearningOutcomes items={outcomes} />
        <GoalProgressCard goal={goal} />
      </section>
    </div>
  );
}
