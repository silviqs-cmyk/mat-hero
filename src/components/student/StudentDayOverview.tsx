"use client";

import { ChevronRight, Lightbulb } from "lucide-react";
import { DayPlanCard } from "@/components/dashboard/DayPlanCard";
import { DayTimeline } from "@/components/dashboard/DayTimeline";
import { InfoCard } from "@/components/dashboard/InfoCard";
import { LearningOutcomes } from "@/components/dashboard/LearningOutcomes";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { PageHeroHeader } from "@/components/ui/PageHeroHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { resolveCourseProgress } from "@/lib/progress";
import {
  buildLessonHref,
  getDashboardProgress,
  getLearningOutcomes,
  getLessonBlocks,
  getPlanSteps,
  mapTimeline,
} from "@/lib/studentFlow";
import type { CourseWithDays, DayContentBundle } from "@/types/course";
import type { UserProgress } from "@/types/user";

interface StudentDayOverviewProps {
  course: CourseWithDays;
  bundle: DayContentBundle;
  progress: UserProgress | null;
}

export function StudentDayOverview({ course, bundle, progress }: StudentDayOverviewProps) {
  const progressValue = getDashboardProgress(progress, course.duration_days);
  void progressValue;
  const resolvedProgress = resolveCourseProgress({
    progress,
    totalDays: course.duration_days,
  });
  const maxUnlockedDay = Math.min(
    course.duration_days,
    Math.max(
      resolvedProgress.currentDayNumber,
      ...resolvedProgress.completedDayNumbers.map((dayNumber) => dayNumber + 1),
    ),
  );
  const timeline = mapTimeline(
    course.days,
    course.slug,
    bundle.day.day_number,
    maxUnlockedDay,
    resolvedProgress.completedDayNumbers,
  );
  const lessonBlocks = getLessonBlocks(bundle);
  const planSteps = getPlanSteps(bundle, course.slug);
  const computedOutcomes = getLearningOutcomes(bundle);
  const outcomes = computedOutcomes.length > 0 ? computedOutcomes : [bundle.day.title];
  const lessonHref = buildLessonHref(course.slug, bundle.day.day_number);
  const daySummary =
    bundle.day.subtitle && !/^Раздел\s+\d+(\s+и\s+Раздел\s+\d+)?$/i.test(bundle.day.subtitle.trim())
      ? bundle.day.subtitle
      : bundle.day.description;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DayPlanCard badge="" title="Как да минеш урока без хаос" steps={planSteps} />

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <NeonCard padding="md">
          <PageHeroHeader
            label=""
            title={<h1 className="mh-heading-xl">{bundle.day.title}</h1>}
            description={daySummary.trim() && daySummary.trim() !== lessonBlocks.keyPoints.trim() ? daySummary : undefined}
          />

          <div className="mt-6">
            <InfoCard label="Най-важното" tone="cyan" icon={<Lightbulb className="h-5 w-5 text-cyan-200" />}>
              <p>{lessonBlocks.keyPoints}</p>
            </InfoCard>
          </div>

          <div className="mt-8">
            <LearningOutcomes items={outcomes} compact />
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:items-end">
            <NeonButton
              href={lessonHref}
              className="min-h-12 w-full px-5 text-base font-semibold sm:w-auto sm:min-w-[13rem] sm:self-end"
            >
              Започни урока
              <ChevronRight className="h-5 w-5" />
            </NeonButton>
          </div>
        </NeonCard>

        <NeonCard padding="lg" className="overflow-hidden">
          <SectionHeader label="План за 10 дни" title={<h2 className="mh-heading-lg">Твоят план</h2>} />
          <DayTimeline items={timeline} />
        </NeonCard>
      </section>
    </div>
  );
}
