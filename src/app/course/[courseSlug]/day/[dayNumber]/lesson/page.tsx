import { TopBarProgressSync } from "@/components/providers/TopBarProgressSync";
import { LessonSectionStepper } from "@/components/student/LessonSectionStepper";
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
  getPublishedLessonVideoUrl,
  parseDayNumberParam,
} from "@/lib/studentFlow";
import { resolveQuestionGroup } from "@/lib/questionGroups";
import { resolveLessonVideo } from "@/lib/video";
import { getCourseDayServer, getPublishedCourseBySlugServer } from "@/services/studentContent.server";
import type { LessonSection } from "@/types/course";

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
          description="Линкът към този ден не е валиден."
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
    .catch((error) => ({
      data: null,
      error: error instanceof Error ? error.message : "Възникна грешка.",
    }));

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
    {
      label: "practice count",
      value: allQuestions.filter((question) => resolveQuestionGroup(question) === "practice").length,
    },
    {
      label: "quiz count",
      value: allQuestions.filter((question) => resolveQuestionGroup(question) === "quiz").length,
    },
    {
      label: "bonus count",
      value: allQuestions.filter((question) => resolveQuestionGroup(question) === "bonus").length,
    },
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
  const theorySections = (lesson.sections ?? [])
    .filter((section) => section.section_type === "theory" && Boolean(section.content?.trim()))
    .sort((left, right) => left.sort_order - right.sort_order);

  const fallbackSection: LessonSection = {
    id: `${lesson.id}-fallback-theory`,
    lesson_id: lesson.id,
    title: lesson.title,
    section_type: "theory",
    content: lesson.content,
    sort_order: 0,
    created_at: lesson.created_at,
    updated_at: lesson.updated_at,
  };

  const stepperSections = theorySections.length > 0 ? theorySections : [fallbackSection];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {debugEnabled ? <StudentFlowDebugCard title="Lesson Route Debug" items={resolvedDebugItems} /> : null}

      <TopBarProgressSync
        value={{
          label: "Теория",
          summary: `Ден ${bundle.day.day_number} от ${course.duration_days}`,
          helper: "Мини през темите една по една и накрая продължи към задачите.",
          value: 1,
          max: 3,
          tone: "cyan",
        }}
      />

      <section>
        <NeonCard padding="lg" className="rounded-[30px]">
          <SectionHeader
            label="Урок"
            title={lesson.title}
            action={<Badge tone="cyan">{lesson.type}</Badge>}
            align="center"
          />

          <p className="mh-copy-muted mt-4">{bundle.day.description}</p>

          <div className="mt-6">
            <LessonSectionStepper
              sections={stepperSections}
              practiceHref={buildPracticeHref(course.slug, bundle.day.day_number)}
            />
          </div>
        </NeonCard>
      </section>
    </div>
  );
}
