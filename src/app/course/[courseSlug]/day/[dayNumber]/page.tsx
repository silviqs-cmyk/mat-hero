import { StudentDayScreen } from "@/components/student/StudentDayScreen";
import { StudentFlowDebugCard } from "@/components/student/StudentFlowDebugCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { NeonButton } from "@/components/ui/NeonButton";
import { requireStudent } from "@/lib/auth/server";
import { getPublishedLessonVideoUrl, parseDayNumberParam } from "@/lib/studentFlow";
import { resolveQuestionGroup } from "@/lib/questionGroups";
import {
  getCourseDayServer,
  getPublishedCourseBySlugServer,
  getUserCourseProgressServer,
} from "@/services/studentContent.server";

export default async function CourseDayPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string; dayNumber: string }>;
  searchParams: Promise<{ debug?: string }>;
}) {
  const { profile } = await requireStudent();
  const { courseSlug, dayNumber: rawDayNumber } = await params;
  const resolvedSearchParams = await searchParams;
  const debugEnabled = resolvedSearchParams.debug === "1" || resolvedSearchParams.debug === "true";
  const dayNumber = parseDayNumberParam(rawDayNumber);

  const debugItems = [
    { label: "courseSlug", value: courseSlug },
    { label: "raw dayNumber", value: rawDayNumber },
    { label: "parsed dayNumber", value: dayNumber },
    { label: "has profile", value: Boolean(profile) },
    { label: "profile id", value: profile?.id },
  ];

  if (!profile) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Day Route Debug" items={debugItems} /> : null}
        <EmptyState
          title="Нужен е вход"
          description="Влез в MatHero, за да продължиш по плана си."
          action={<NeonButton href="/login">Към входа</NeonButton>}
        />
      </div>
    );
  }

  if (dayNumber === null) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Day Route Debug" items={debugItems} /> : null}
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
    if (!course) {
      return { course: null, progress: null, bundle: null };
    }

    const progress = await getUserCourseProgressServer(profile.id, course.id);
    const bundle = await getCourseDayServer(course.slug, dayNumber);
    return { course, progress, bundle };
  })()
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => ({ data: null, error: error instanceof Error ? error.message : "Възникна грешка при зареждането." }));

  const lesson = loadResult.data?.bundle?.lessons[0] ?? null;
  const allQuestions = loadResult.data?.bundle?.questions ?? [];
  const practiceCount = allQuestions.filter((question) => resolveQuestionGroup(question) === "practice").length;
  const quizCount = allQuestions.filter((question) => resolveQuestionGroup(question) === "quiz").length;
  const bonusCount = allQuestions.filter((question) => resolveQuestionGroup(question) === "bonus").length;
  const resolvedDebugItems = [
    ...debugItems,
    { label: "load error", value: loadResult.error },
    { label: "course found", value: Boolean(loadResult.data?.course) },
    { label: "course id", value: loadResult.data?.course?.id },
    { label: "bundle found", value: Boolean(loadResult.data?.bundle) },
    { label: "day id", value: loadResult.data?.bundle?.day.id },
    { label: "lesson count", value: loadResult.data?.bundle?.lessons.length ?? 0 },
    { label: "first lesson id", value: lesson?.id },
    { label: "video status", value: lesson?.video_status },
    { label: "video url", value: lesson?.video_url },
    { label: "published video url", value: getPublishedLessonVideoUrl(lesson) },
    { label: "questions total", value: allQuestions.length },
    { label: "practice count", value: practiceCount },
    { label: "quiz count", value: quizCount },
    { label: "bonus count", value: bonusCount },
  ];

  if (loadResult.error) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Day Route Debug" items={resolvedDebugItems} /> : null}
        <ErrorState
          title="Не успях да заредя съдържанието"
          description={loadResult.error}
          action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
        />
      </div>
    );
  }

  if (!loadResult.data?.course) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Day Route Debug" items={resolvedDebugItems} /> : null}
        <EmptyState title="Няма такъв курс" description="Този курс не е наличен или не е публикуван." />
      </div>
    );
  }

  if (!loadResult.data.bundle) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Day Route Debug" items={resolvedDebugItems} /> : null}
        <EmptyState title="Няма налично съдържание" description="Този ден още няма публикуван урок или задачи." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {debugEnabled ? <StudentFlowDebugCard title="Day Route Debug" items={resolvedDebugItems} /> : null}
      <StudentDayScreen
        course={loadResult.data.course}
        bundle={loadResult.data.bundle}
        progress={loadResult.data.progress}
      />
    </div>
  );
}
