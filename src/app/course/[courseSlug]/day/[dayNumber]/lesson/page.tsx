import { BookOpenCheck, ChevronRight, Lightbulb, PlayCircle } from "lucide-react";
import { MascotCharacter } from "@/components/MascotCharacter";
import { InfoCard } from "@/components/dashboard/InfoCard";
import { TopBarProgressSync } from "@/components/providers/TopBarProgressSync";
import { StudentFlowDebugCard } from "@/components/student/StudentFlowDebugCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { requireStudent } from "@/lib/auth/server";
import {
  buildPracticeHref,
  buildVideoHref,
  getPublishedLessonVideoUrl,
  hasPublishedLessonVideo,
  parseDayNumberParam,
} from "@/lib/studentFlow";
import { resolveQuestionGroup } from "@/lib/questionGroups";
import { resolveLessonVideo } from "@/lib/video";
import { getCourseDayServer, getPublishedCourseBySlugServer } from "@/services/studentContent.server";

export default async function CourseLessonPage({
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
        {debugEnabled ? <StudentFlowDebugCard title="Lesson Route Debug" items={baseDebugItems} /> : null}
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
  const allQuestions = loadResult.data?.bundle?.questions ?? [];
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
    { label: "resolved video", value: Boolean(resolveLessonVideo(publishedVideoUrl)) },
    { label: "lesson sections", value: lesson?.sections?.length ?? 0 },
    { label: "questions total", value: allQuestions.length },
    { label: "practice count", value: allQuestions.filter((question) => resolveQuestionGroup(question) === "practice").length },
    { label: "quiz count", value: allQuestions.filter((question) => resolveQuestionGroup(question) === "quiz").length },
    { label: "bonus count", value: allQuestions.filter((question) => resolveQuestionGroup(question) === "bonus").length },
  ];

  if (loadResult.error) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Lesson Route Debug" items={resolvedDebugItems} /> : null}
        <ErrorState
          title="Не успях да заредя урока"
          description={loadResult.error}
          action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
        />
      </div>
    );
  }

  if (!loadResult.data?.course || !loadResult.data.bundle) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Lesson Route Debug" items={resolvedDebugItems} /> : null}
        <EmptyState
          title="Няма налично съдържание"
          description="Този ден още няма публикуван урок или задачи."
          action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
        />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Lesson Route Debug" items={resolvedDebugItems} /> : null}
        <EmptyState
          title="Няма урок за този ден"
          description="Публикувай lesson в CMS-а и той ще се появи тук."
        />
      </div>
    );
  }

  const course = loadResult.data.course;
  const bundle = loadResult.data.bundle;
  const hasVideoLink = hasPublishedLessonVideo(lesson);
  const resolvedVideo = resolveLessonVideo(publishedVideoUrl);
  const theorySection =
    lesson.sections?.find((section) => ["theory", "tip", "warning", "formula"].includes(section.section_type)) ??
    lesson.sections?.[0];
  const exampleSection =
    lesson.sections?.find((section) => section.section_type === "example") ??
    lesson.sections?.[1] ??
    lesson.sections?.[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {debugEnabled ? <StudentFlowDebugCard title="Lesson Route Debug" items={resolvedDebugItems} /> : null}

      <TopBarProgressSync
        value={{
          label: "Теория и пример",
          summary: `Ден ${bundle.day.day_number} от ${course.duration_days}`,
          helper: "Прочети урока и после продължи към видеото или задачите.",
          value: 1,
          max: 3,
          tone: "cyan",
        }}
      />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <NeonCard padding="lg" className="rounded-[30px]">
          <SectionHeader
            label="Урок"
            title={lesson.title}
            action={<Badge tone="cyan">{lesson.type}</Badge>}
            align="center"
          />
          <p className="mh-copy-muted mt-4">{bundle.day.description}</p>

          {resolvedVideo ? (
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
                <div className="flex items-center justify-between gap-4 px-5 py-5">
                  <p className="text-sm text-slate-300">Видеото е налично като външен ресурс.</p>
                  <NeonButton href={publishedVideoUrl ?? "#"} variant="ghost" className="min-h-0 px-3 py-2 text-xs">
                    Гледай видео
                  </NeonButton>
                </div>
              )}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <InfoCard
              label={theorySection?.title ?? "Най-важното"}
              tone="cyan"
              icon={<Lightbulb className="h-5 w-5 text-cyan-200" />}
            >
              <p>{theorySection?.content ?? lesson.content}</p>
            </InfoCard>
            <InfoCard
              label={exampleSection?.title ?? "Пример"}
              tone="purple"
              icon={<BookOpenCheck className="h-5 w-5 text-fuchsia-200" />}
            >
              <p>{exampleSection?.content ?? lesson.content}</p>
            </InfoCard>
          </div>

          {lesson.sections && lesson.sections.length > 0 ? (
            <div className="mt-6 grid gap-3">
              {lesson.sections.map((section) => (
                <NeonCard key={section.id} padding="sm" className="rounded-[22px]">
                  <p className="mh-label">{section.title}</p>
                  <p className="mt-3 text-[1rem] leading-7 text-slate-200">{section.content}</p>
                </NeonCard>
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-4 2xl:flex-row">
            {hasVideoLink ? (
              <NeonButton
                href={buildVideoHref(course.slug, bundle.day.day_number)}
                variant="secondary"
                className="min-h-14 w-full px-6 text-[1.1rem] 2xl:w-auto"
              >
                <PlayCircle className="h-5 w-5" />
                Към видеото
              </NeonButton>
            ) : null}
            <NeonButton
              href={buildPracticeHref(course.slug, bundle.day.day_number)}
              className="min-h-14 w-full px-8 text-[1.15rem] 2xl:flex-1"
            >
              Продължи към задачите
              <ChevronRight className="h-5 w-5" />
            </NeonButton>
          </div>
        </NeonCard>

        <MascotCharacter
          mood="happy"
          message="Прегледай теорията, мини през примера и после затвърди с практическите задачи."
          xpText="+25 XP след тест"
        />
      </section>
    </div>
  );
}
