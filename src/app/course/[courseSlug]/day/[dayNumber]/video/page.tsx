import { ChevronRight, ExternalLink, PlayCircle } from "lucide-react";
import { DayTopBarProgress } from "@/components/student/DayTopBarProgress";
import { StudentFlowDebugCard } from "@/components/student/StudentFlowDebugCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { requireStudent } from "@/lib/auth/server";
import { hasMiniTestQuestions } from "@/lib/questionGroups";
import {
  buildLessonHref,
  buildPracticeHref,
  buildQuizHref,
  getPublishedLessonVideoUrl,
  parseDayNumberParam,
} from "@/lib/studentFlow";
import { resolveLessonVideo } from "@/lib/video";
import { getCourseDayServer, getPublishedCourseBySlugServer } from "@/services/studentContent.server";

export default async function CourseVideoPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string; dayNumber: string }>;
  searchParams: Promise<{ debug?: string }>;
}) {
  await requireStudent();
  const { courseSlug, dayNumber: rawDayNumber } = await params;
  const resolvedSearchParams = await searchParams;
  const debugEnabled = resolvedSearchParams.debug === "1" || resolvedSearchParams.debug === "true";
  const dayNumber = parseDayNumberParam(rawDayNumber);

  const baseDebugItems = [
    { label: "courseSlug", value: courseSlug },
    { label: "raw dayNumber", value: rawDayNumber },
    { label: "parsed dayNumber", value: dayNumber },
  ];

  if (dayNumber === null) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Video Route Debug" items={baseDebugItems} /> : null}
        <EmptyState
          title="Невалиден ден"
          description="Линкът към деня не е валиден."
          action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
        />
      </div>
    );
  }

  const loadResult = await (async () => {
    const course = await getPublishedCourseBySlugServer(courseSlug);
    const bundle = await getCourseDayServer(courseSlug, dayNumber);
    return { course, bundle };
  })()
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => ({ data: null, error: error instanceof Error ? error.message : "Възникна грешка." }));

  const lesson = loadResult.data?.bundle?.lessons[0] ?? null;
  const publishedVideoUrl = getPublishedLessonVideoUrl(lesson);
  const resolvedVideo = resolveLessonVideo(publishedVideoUrl);
  const resolvedDebugItems = [
    ...baseDebugItems,
    { label: "load error", value: loadResult.error },
    { label: "course found", value: Boolean(loadResult.data?.course) },
    { label: "bundle found", value: Boolean(loadResult.data?.bundle) },
    { label: "lesson found", value: Boolean(lesson) },
    { label: "lesson id", value: lesson?.id },
    { label: "lesson title", value: lesson?.title },
    { label: "video status", value: lesson?.video_status },
    { label: "video url", value: lesson?.video_url },
    { label: "published video url", value: publishedVideoUrl },
    { label: "resolved video kind", value: resolvedVideo?.kind },
  ];

  if (loadResult.error) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Video Route Debug" items={resolvedDebugItems} /> : null}
        <ErrorState
          title="Не успях да заредя видеото"
          description={loadResult.error}
          action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
        />
      </div>
    );
  }

  if (!loadResult.data?.course || !loadResult.data.bundle) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Video Route Debug" items={resolvedDebugItems} /> : null}
        <EmptyState
          title="Няма налично съдържание"
          description="Този ден още няма публикуван урок или задачи."
          action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
        />
      </div>
    );
  }

  const course = loadResult.data.course;
  const bundle = loadResult.data.bundle;
  const lessonHref = buildLessonHref(course.slug, bundle.day.day_number);
  const practiceHref = buildPracticeHref(course.slug, bundle.day.day_number);
  const quizHref = buildQuizHref(course.slug, bundle.day.day_number);
  const hasQuizQuestions = hasMiniTestQuestions(bundle.questions);
  const nextHref = hasQuizQuestions ? quizHref : practiceHref;
  const nextLabel = hasQuizQuestions ? "Към теста" : "Към упражненията";

  if (!lesson || !resolvedVideo) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Video Route Debug" items={resolvedDebugItems} /> : null}
        <EmptyState
          title="Няма видео за този ден"
          description="За този урок още няма добавено публикувано видео."
          action={<NeonButton href={lessonHref}>Към урока</NeonButton>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {debugEnabled ? <StudentFlowDebugCard title="Video Route Debug" items={resolvedDebugItems} /> : null}

      <DayTopBarProgress
        courseSlug={course.slug}
        dayNumber={bundle.day.day_number}
        label="Видео урок"
        helper={hasQuizQuestions ? "Гледай видеото и после мини към теста." : "Гледай видеото и после мини към упражненията."}
        currentStep="video"
        currentStepCompleted
      />

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
          <NeonButton href={lessonHref} variant="secondary" className="min-h-14 w-full px-6 text-[1.1rem] 2xl:w-auto">
            <PlayCircle className="h-5 w-5" />
            Към урока
          </NeonButton>

          <NeonButton href={nextHref} className="min-h-14 w-full px-8 text-[1.15rem] 2xl:flex-1">
            {nextLabel}
            <ChevronRight className="h-5 w-5" />
          </NeonButton>

          {hasQuizQuestions ? (
            <NeonButton
              href={practiceHref}
              variant="ghost"
              className="min-h-14 w-full px-6 text-[1rem] 2xl:w-auto"
            >
              <ExternalLink className="h-5 w-5" />
              Към упражненията
            </NeonButton>
          ) : publishedVideoUrl ? (
            <NeonButton
              href={publishedVideoUrl}
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
