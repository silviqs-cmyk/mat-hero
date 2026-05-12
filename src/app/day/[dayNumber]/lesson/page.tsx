import { TopBarProgressSync } from "@/components/providers/TopBarProgressSync";
import { LessonSectionStepper } from "@/components/student/LessonSectionStepper";
import { StudentFlowDebugCard } from "@/components/student/StudentFlowDebugCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { PageHeroHeader } from "@/components/ui/PageHeroHeader";
import { requireStudent } from "@/lib/auth/server";
import { expandLessonSectionToTopics } from "@/lib/lessonTopics";
import { hasMiniTestQuestions } from "@/lib/questionGroups";
import {
  buildPracticeHref,
  buildQuizHref,
  buildVideoHref,
  getPublishedLessonVideoUrl,
  parseDayNumberParam,
} from "@/lib/studentFlow";
import {
  getCourseDayByNumberServer,
  getDefaultPublishedCourseServer,
} from "@/services/studentContent.server";
import type { LessonSection } from "@/types/course";

const SUPPORTED_SECTION_TYPES = new Set(["theory", "example", "formula", "tip", "warning"]);

export default async function DayLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ dayNumber: string }>;
  searchParams: Promise<{ debug?: string }>;
}) {
  await requireStudent();

  const { dayNumber: rawDayNumber } = await params;
  const resolvedSearchParams = await searchParams;
  const debugEnabled = resolvedSearchParams.debug === "1" || resolvedSearchParams.debug === "true";
  const dayNumber = parseDayNumberParam(rawDayNumber);

  const baseDebugItems = [
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
    const course = await getDefaultPublishedCourseServer();
    if (!course) {
      return { course: null, bundle: null };
    }

    const bundle = await getCourseDayByNumberServer(dayNumber);
    return { course, bundle };
  })()
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => ({
      data: null,
      error: error instanceof Error ? error.message : "Възникна грешка.",
    }));

  const lesson = loadResult.data?.bundle?.lessons[0] ?? null;
  const resolvedDebugItems = [
    ...baseDebugItems,
    { label: "load error", value: loadResult.error },
    { label: "course found", value: Boolean(loadResult.data?.course) },
    { label: "bundle found", value: Boolean(loadResult.data?.bundle) },
    { label: "lesson found", value: Boolean(lesson) },
    { label: "lesson id", value: lesson?.id },
    { label: "lesson title", value: lesson?.title },
    { label: "lesson sections", value: lesson?.sections?.length ?? 0 },
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
          description="Публикувай lesson в админ панела и той ще се появи тук."
          action={<NeonButton href={`/day/${dayNumber}`}>Назад към деня</NeonButton>}
        />
      </div>
    );
  }

  const course = loadResult.data.course;
  const bundle = loadResult.data.bundle;
  const hasQuizQuestions = hasMiniTestQuestions(bundle.questions);
  const publishedVideoUrl = getPublishedLessonVideoUrl(lesson);
  const supportedSections = (lesson.sections ?? [])
    .filter(
      (section) =>
        SUPPORTED_SECTION_TYPES.has(section.section_type) && Boolean(section.content?.trim()),
    )
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

  const stepperSections =
    supportedSections.length > 0
      ? supportedSections
      : lesson.content?.trim()
        ? expandLessonSectionToTopics(fallbackSection)
        : [];

  if (stepperSections.length === 0) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Lesson Route Debug" items={resolvedDebugItems} /> : null}
        <EmptyState
          title="Няма съдържание за този урок"
          description="Добави lesson sections или съдържание към lesson-а, за да се покаже тук."
          action={<NeonButton href={`/day/${dayNumber}`}>Назад към деня</NeonButton>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {debugEnabled ? <StudentFlowDebugCard title="Lesson Route Debug" items={resolvedDebugItems} /> : null}

      <TopBarProgressSync
        value={{
          label: "Теория",
          summary: `Ден ${bundle.day.day_number} от ${course.duration_days}`,
          helper: "Мини през темите една по една и накрая продължи към теста или задачите.",
          value: 1,
          max: Math.max(stepperSections.length, 1),
          tone: "cyan",
        }}
      />

      <section>
        <NeonCard padding="lg" className="rounded-[30px]">
          <PageHeroHeader
            label="Урок"
            title={lesson.title}
            action={<Badge tone="cyan">{lesson.type}</Badge>}
            description={bundle.day.description}
          />

          <div className="mt-6">
            <LessonSectionStepper
              sections={stepperSections}
              practiceHref={buildPracticeHref(course.slug, bundle.day.day_number)}
              videoHref={
                publishedVideoUrl
                  ? buildVideoHref(course.slug, bundle.day.day_number)
                  : undefined
              }
              finalHref={
                hasQuizQuestions
                  ? buildQuizHref(course.slug, bundle.day.day_number)
                  : buildPracticeHref(course.slug, bundle.day.day_number)
              }
              finalLabel={
                hasQuizQuestions
                  ? "\u041a\u044a\u043c \u0442\u0435\u0441\u0442\u0430"
                  : "\u041a\u044a\u043c \u0437\u0430\u0434\u0430\u0447\u0438\u0442\u0435"
              }
            />
          </div>
        </NeonCard>
      </section>
    </div>
  );
}
