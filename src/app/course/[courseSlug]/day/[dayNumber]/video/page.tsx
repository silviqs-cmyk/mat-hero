"use client";

import { useLayoutEffect } from "react";
import { useParams } from "next/navigation";
import { ChevronRight, ExternalLink, PlayCircle } from "lucide-react";
import { useTopBarProgress } from "@/components/providers/TopBarProgressProvider";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Badge } from "@/components/ui/Badge";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useCourse } from "@/hooks/useCourse";
import { useDayContentBundle } from "@/hooks/useDayContentBundle";
import { buildLessonHref, buildPracticeHref } from "@/lib/studentFlow";
import { resolveLessonVideo } from "@/lib/video";

export default function CourseVideoPage() {
  const params = useParams<{ courseSlug: string; dayNumber: string }>();
  const { setProgress: setTopBarProgress } = useTopBarProgress();
  const dayNumber = Number(params.dayNumber);
  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(params.courseSlug);
  const { data: bundle, isLoading: bundleLoading, error: bundleError } = useDayContentBundle(
    params.courseSlug,
    Number.isFinite(dayNumber) ? dayNumber : 1,
  );
  const lesson = bundle?.lessons[0];
  const resolvedVideo = resolveLessonVideo(lesson?.video_url ?? null);

  useLayoutEffect(() => {
    if (!bundle || !course) {
      return;
    }

    setTopBarProgress({
      label: "Видео урок",
      summary: `Ден ${bundle.day.day_number} от ${course.duration_days}`,
      helper: "Изгледай видеото и после мини към задачите.",
      value: 1,
      max: 3,
      tone: "cyan",
    });

    return () => {
      setTopBarProgress(null);
    };
  }, [bundle, course, setTopBarProgress]);

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

  if (!course || !bundle || !lesson || !resolvedVideo) {
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
          {resolvedVideo.kind === "embed" ? (
            <div className="aspect-video">
              <iframe
                src={resolvedVideo.src}
                title={lesson.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : resolvedVideo.kind === "file" ? (
            <video
              src={resolvedVideo.src}
              controls
              preload="metadata"
              className="aspect-video h-full w-full bg-black"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center px-6 text-center text-slate-200">
              Това видео се отваря чрез външен линк.
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4 2xl:flex-row">
          <NeonButton
            href={buildLessonHref(params.courseSlug, dayNumber)}
            variant="secondary"
            className="min-h-14 w-full px-6 text-[1.1rem] 2xl:w-auto"
          >
            <PlayCircle className="h-5 w-5" />
            Към урока
          </NeonButton>

          <NeonButton
            href={buildPracticeHref(params.courseSlug, dayNumber)}
            className="min-h-14 w-full px-8 text-[1.15rem] 2xl:flex-1"
          >
            Към задачите
            <ChevronRight className="h-5 w-5" />
          </NeonButton>

          {lesson.video_url ? (
            <NeonButton
              href={lesson.video_url}
              variant="ghost"
              className="min-h-14 w-full px-6 text-[1rem] 2xl:w-auto"
            >
              <ExternalLink className="h-5 w-5" />
              Оригинал
            </NeonButton>
          ) : null}
        </div>
      </NeonCard>
    </div>
  );
}
