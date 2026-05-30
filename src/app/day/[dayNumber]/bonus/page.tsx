import { CourseQuestionPage } from "@/components/student/CourseQuestionPage";
import { StudentFlowDebugCard } from "@/components/student/StudentFlowDebugCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { NeonButton } from "@/components/ui/NeonButton";
import { requireStudent } from "@/lib/auth/server";
import { parseDayNumberParam } from "@/lib/studentFlow";
import { resolveQuestionGroup } from "@/lib/questionGroups";
import {
  getCourseDayByNumberServer,
  getDefaultPublishedCourseServer,
  getQuestionsWithOptionsForDayServer,
  getUserCourseProgressServer,
} from "@/services/studentContent.server";

export default async function DayBonusPage({
  params,
  searchParams,
}: {
  params: Promise<{ dayNumber: string }>;
  searchParams: Promise<{ debug?: string }>;
}) {
  const { profile } = await requireStudent();
  const { dayNumber: rawDayNumber } = await params;
  const resolvedSearchParams = await searchParams;
  const debugEnabled = resolvedSearchParams.debug === "1" || resolvedSearchParams.debug === "true";
  const dayNumber = parseDayNumberParam(rawDayNumber);

  const baseDebugItems = [
    { label: "raw dayNumber", value: rawDayNumber },
    { label: "parsed dayNumber", value: dayNumber },
    { label: "has profile", value: Boolean(profile) },
  ];

  if (!profile) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Изпитай се Debug" items={baseDebugItems} /> : null}
        <EmptyState
          title="Нужен е вход"
          description="Влез в MatHero, за да решаваш реални задачи от НВО и да запазваш напредъка си."
          action={<NeonButton href="/login">Към входа</NeonButton>}
        />
      </div>
    );
  }

  if (dayNumber === null) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Изпитай се Debug" items={baseDebugItems} /> : null}
        <EmptyState
          title="Невалиден ден"
          description="Линкът към деня не е валиден."
          action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
        />
      </div>
    );
  }

  const loadResult = await (async () => {
    const course = await getDefaultPublishedCourseServer();
    if (!course) {
      return {
        course: null,
        progress: null,
        bundle: null,
        questions: [] as Awaited<ReturnType<typeof getQuestionsWithOptionsForDayServer>>,
      };
    }

    const [progress, bundle] = await Promise.all([
      getUserCourseProgressServer(profile.id, course.id),
      getCourseDayByNumberServer(dayNumber),
    ]);
    const questions = bundle ? await getQuestionsWithOptionsForDayServer(bundle.day.id, true, "bonus") : [];
    return { course, progress, bundle, questions };
  })()
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => ({
      data: null,
      error: error instanceof Error ? error.message : "Възникна грешка.",
    }));

  const allQuestions = loadResult.data?.bundle?.questions ?? [];
  console.log("[DayBonusPage] loaded", {
    dayNumber,
    bundleQuestionsCount: allQuestions.length,
    bundleBonusQuestionsCount: allQuestions.filter((question) => resolveQuestionGroup(question) === "bonus").length,
    loadedBonusQuestionsCount: loadResult.data?.questions.length ?? 0,
    loadError: loadResult.error,
  });
  const resolvedDebugItems = [
    ...baseDebugItems,
    { label: "load error", value: loadResult.error },
    { label: "course found", value: Boolean(loadResult.data?.course) },
    { label: "bundle found", value: Boolean(loadResult.data?.bundle) },
    { label: "day id", value: loadResult.data?.bundle?.day.id },
    { label: "bundle questions", value: allQuestions.length },
    {
      label: "izpitai-se in bundle",
      value: allQuestions.filter((question) => resolveQuestionGroup(question) === "bonus").length,
    },
    { label: "loaded izpitai-se", value: loadResult.data?.questions.length ?? 0 },
  ];

  if (loadResult.error) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Изпитай се Debug" items={resolvedDebugItems} /> : null}
        <ErrorState
          title="Не успях да заредя Изпитай се"
          description={loadResult.error}
          action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
        />
      </div>
    );
  }

  if (!loadResult.data?.course) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Изпитай се Debug" items={resolvedDebugItems} /> : null}
        <EmptyState title="Няма такъв курс" description="Този курс не е наличен или не е публикуван." />
      </div>
    );
  }

  if (!loadResult.data.bundle) {
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Изпитай се Debug" items={resolvedDebugItems} /> : null}
        <EmptyState title="Няма налично съдържание" description="Този ден още няма публикуван урок или задачи." />
      </div>
    );
  }

  if (loadResult.data.questions.length === 0) {
    console.log("[DayBonusPage] empty-state", {
      dayNumber,
      reason: "no-bonus-questions-loaded",
      bundleQuestionsCount: allQuestions.length,
      bundleBonusQuestionsCount: allQuestions.filter((question) => resolveQuestionGroup(question) === "bonus").length,
      loadedBonusQuestionsCount: loadResult.data.questions.length,
    });
    return (
      <div className="space-y-6">
        {debugEnabled ? <StudentFlowDebugCard title="Изпитай се Debug" items={resolvedDebugItems} /> : null}
        <EmptyState
          title="Още няма задачи за Изпитай се"
          description="Добави публикувани задачи от НВО за този ден и те ще се появят тук."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {debugEnabled ? <StudentFlowDebugCard title="Изпитай се Debug" items={resolvedDebugItems} /> : null}
      <CourseQuestionPage
        mode="bonus"
        course={loadResult.data.course}
        bundle={loadResult.data.bundle}
        questions={loadResult.data.questions}
        profile={profile}
        progress={loadResult.data.progress}
      />
    </div>
  );
}
