"use client";

import { useLayoutEffect } from "react";
import { BookOpenCheck, ChevronRight, Lightbulb, Play } from "lucide-react";
import { DayPlanCard } from "@/components/dashboard/DayPlanCard";
import { DayTimeline } from "@/components/dashboard/DayTimeline";
import { InfoCard } from "@/components/dashboard/InfoCard";
import { LearningOutcomes } from "@/components/dashboard/LearningOutcomes";
import { useTopBarProgress } from "@/components/providers/TopBarProgressProvider";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  buildLessonHref,
  buildVideoHref,
  getDashboardProgress,
  getLearningOutcomes,
  getLessonBlocks,
  getPlanSteps,
  getPublishedLessonVideoUrl,
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
  const { setProgress: setTopBarProgress } = useTopBarProgress();
  const progressValue = getDashboardProgress(progress, course.duration_days);
  const timeline = mapTimeline(course.days, course.slug, bundle.day.day_number);
  const lessonBlocks = getLessonBlocks(bundle);
  const planSteps = getPlanSteps(bundle, course.slug);
  const computedOutcomes = getLearningOutcomes(bundle);
  const outcomes = computedOutcomes.length > 0 ? computedOutcomes : [bundle.day.title];
  const lessonHref = buildLessonHref(course.slug, bundle.day.day_number);
  const publishedVideoUrl = getPublishedLessonVideoUrl(bundle.lessons[0]);
  const videoDuration = bundle.lessons[0]?.estimated_minutes
    ? `${bundle.lessons[0].estimated_minutes}:00 мин`
    : "5:00 мин";
  const daySummary =
    bundle.day.subtitle && !/^Раздел\s+\d+(\s+и\s+Раздел\s+\d+)?$/i.test(bundle.day.subtitle.trim())
      ? bundle.day.subtitle
      : bundle.day.description;

  useLayoutEffect(() => {
    setTopBarProgress({
      label: "Напредък в плана",
      summary: `Ден ${bundle.day.day_number} от ${course.duration_days}`,
      helper: "Всеки ден затваря още една стъпка от плана.",
      value: progressValue,
      max: 100,
      tone: "cyan",
    });

    return () => {
      setTopBarProgress(null);
    };
  }, [bundle.day.day_number, course.duration_days, progressValue, setTopBarProgress]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DayPlanCard badge="" title="Как да минеш урока без хаос" steps={planSteps} />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <NeonCard padding="md">
          <SectionHeader
            label={`Ден ${bundle.day.day_number} от ${course.duration_days}`}
            title={<h1 className="mh-heading-xl">{bundle.day.title}</h1>}
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
            {publishedVideoUrl ? (
              <NeonButton
                href={buildVideoHref(course.slug, bundle.day.day_number)}
                variant="secondary"
                className="min-h-14 w-full px-6 text-[1.1rem] 2xl:w-auto"
              >
                <Play className="h-5 w-5" />
                Виж видео ({videoDuration})
              </NeonButton>
            ) : null}

            <NeonButton href={lessonHref} className="min-h-14 w-full px-8 text-[1.15rem] 2xl:flex-1">
              Започни урока
              <ChevronRight className="h-5 w-5" />
            </NeonButton>
          </div>

          <div className="mt-5">
            <LearningOutcomes items={outcomes} compact />
          </div>
        </NeonCard>

        <NeonCard padding="md">
          <SectionHeader label="План за 10 дни" title={<h2 className="mh-heading-lg">Твоят план</h2>} />
          <DayTimeline items={timeline} />
        </NeonCard>
      </section>
    </div>
  );
}
