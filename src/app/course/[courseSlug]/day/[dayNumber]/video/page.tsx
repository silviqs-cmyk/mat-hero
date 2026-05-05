"use client";

import { useParams } from "next/navigation";
import { ChevronRight, ExternalLink, PlayCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Badge } from "@/components/ui/Badge";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useCourse } from "@/hooks/useCourse";
import { useDayContentBundle } from "@/hooks/useDayContentBundle";
import { buildLessonHref, buildPracticeHref, getEmbeddedVideoUrl } from "@/lib/studentFlow";

export default function CourseVideoPage() {
  const params = useParams<{ courseSlug: string; dayNumber: string }>();
  const dayNumber = Number(params.dayNumber);
  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(params.courseSlug);
  const { data: bundle, isLoading: bundleLoading, error: bundleError } = useDayContentBundle(
    params.courseSlug,
    Number.isFinite(dayNumber) ? dayNumber : 1,
  );

  if (courseLoading || bundleLoading) {
    return <LoadingState title="Зареждам видеото" lines={4} />;
  }

  if (courseError || bundleError) {
    return (
      <ErrorState
        title="Не успях да заредя видеото"
        description={courseError ?? bundleError ?? "Възникна грешка."}
        action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
      />
    );
  }

  const lesson = bundle?.lessons[0];
  const embeddedVideoUrl = getEmbeddedVideoUrl(lesson?.video_url ?? null);

  if (!course || !bundle || !lesson || !embeddedVideoUrl) {
    return (
      <EmptyState
        title="Няма видео за този ден"
        description="За този урок още няма добавено видео."
        action={<NeonButton href={buildLessonHref(params.courseSlug, dayNumber)}>Към урока</NeonButton>}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <NeonCard padding="lg" className="rounded-[30px]">
        <SectionHeader
          label="Видео"
          title={lesson.title}
          action={<Badge tone="cyan">Ден {bundle.day.day_number}</Badge>}
          align="center"
        />

        <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10 bg-black">
          <div className="aspect-video">
            <iframe
              src={embeddedVideoUrl}
              title={lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 2xl:flex-row">
          <NeonButton href={buildLessonHref(params.courseSlug, dayNumber)} variant="secondary" className="min-h-14 w-full px-6 text-[1.1rem] 2xl:w-auto">
            <PlayCircle className="h-5 w-5" />
            Към урока
          </NeonButton>

          <NeonButton href={buildPracticeHref(params.courseSlug, dayNumber)} className="min-h-14 w-full px-8 text-[1.15rem] 2xl:flex-1">
            Към задачите
            <ChevronRight className="h-5 w-5" />
          </NeonButton>

          <NeonButton href={lesson.video_url ?? "#"} variant="ghost" className="min-h-14 w-full px-6 text-[1rem] 2xl:w-auto">
            <ExternalLink className="h-5 w-5" />
            Оригинал
          </NeonButton>
        </div>
      </NeonCard>
    </div>
  );
}
