import { DayTopBarProgress } from "@/components/student/DayTopBarProgress";
import { LessonSectionStepper } from "@/components/student/LessonSectionStepper";
import { StudentFlowDebugCard } from "@/components/student/StudentFlowDebugCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { PageHeroHeader } from "@/components/ui/PageHeroHeader";
import { requireStudent } from "@/lib/auth/server";
import { buildLessonSectionsFromTheoryContent } from "@/lib/parseTheoryContent";
import { buildPracticeHref, buildQuizHref, buildVideoHref, parseDayNumberParam } from "@/lib/studentFlow";
import { findLessonSectionIndexForTopic } from "@/lib/topicLabels";
import { hasMiniTestQuestions } from "@/lib/questionGroups";
import {
  getCourseDayByNumberServer,
  getDefaultPublishedCourseServer,
} from "@/services/studentContent.server";

export default async function DayLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ dayNumber: string }>;
  searchParams: Promise<{ debug?: string; topic?: string }>;
}) {
  await requireStudent();

  const { dayNumber: rawDayNumber } = await params;
  const resolvedSearchParams = await searchParams;
  const debugEnabled = resolvedSearchParams.debug === "1" || resolvedSearchParams.debug === "true";
  const selectedTopic = resolvedSearchParams.topic;
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
          description="Публикувай урок в админ панела и той ще се появи тук."
          action={<NeonButton href={`/day/${dayNumber}`}>Назад към деня</NeonButton>}
        />
      </div>
    );
  }

  const course = loadResult.data.course;
  const bundle = loadResult.data.bundle;
  const videoHref = buildVideoHref(course.slug, bundle.day.day_number);
  const nextHref = hasMiniTestQuestions(bundle.questions)
    ? buildQuizHref(course.slug, bundle.day.day_number)
    : buildPracticeHref(course.slug, bundle.day.day_number);
  const nextLabel = hasMiniTestQuestions(bundle.questions) ? "Към теста" : "Към задачите";
  const parsedSections = lesson.content?.trim()
    ? buildLessonSectionsFromTheoryContent(
        {
          id: lesson.id,
          lesson_id: lesson.id,
          is_published: true,
          created_at: lesson.created_at,
          updated_at: lesson.updated_at,
        },
        lesson.content,
        lesson.title,
        lesson.sections ?? [],
      )
    : [];

  const stepperSections = (parsedSections.length > 0 ? parsedSections : lesson.sections ?? [])
    .filter((section) => Boolean(section.content?.trim()))
    .map((section) => ({ ...section, section_type: "theory" }))
    .sort((left, right) => left.sort_order - right.sort_order);
  const resolvedSections = stepperSections.map((section, index) =>
    index === 0 && lesson.video_status === "published" && lesson.video_url && !section.video_url
      ? {
          ...section,
          video_url: lesson.video_url,
          video_provider: lesson.video_provider,
          video_status: "published" as const,
        }
      : section,
  );
  const initialSectionIndex = findLessonSectionIndexForTopic(resolvedSections, selectedTopic);

  if (resolvedSections.length === 0) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Lesson Route Debug" items={resolvedDebugItems} /> : null}
        <EmptyState
          title="Няма съдържание за този урок"
          description="Добави теория или съдържание към урока, за да се покаже тук."
          action={<NeonButton href={`/day/${dayNumber}`}>Назад към деня</NeonButton>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {debugEnabled ? <StudentFlowDebugCard title="Lesson Route Debug" items={resolvedDebugItems} /> : null}

      <DayTopBarProgress
        courseSlug={course.slug}
        dayNumber={bundle.day.day_number}
        label="Урок"
        helper="Мини през темите и стигни до края на теорията."
      />

      <section className="space-y-6">
        <NeonCard padding="lg" className="rounded-[30px]">
          <PageHeroHeader
            label="Урок"
            title={lesson.title}
            action={<Badge tone="cyan">{lesson.type}</Badge>}
          />

          <div className="mt-6">
            <LessonSectionStepper
              sections={resolvedSections}
              practiceHref={nextHref}
              videoHref={videoHref}
              finalHref={nextHref}
              finalLabel={nextLabel}
              initialSectionIndex={initialSectionIndex}
              courseSlug={course.slug}
              dayNumber={bundle.day.day_number}
            />
          </div>
        </NeonCard>
      </section>
    </div>
  );
}
