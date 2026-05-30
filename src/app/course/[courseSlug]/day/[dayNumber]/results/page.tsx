import { DayResultsSummary } from "@/components/student/DayResultsSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { NeonButton } from "@/components/ui/NeonButton";
import { requireStudent } from "@/lib/auth/server";
import { parseDayNumberParam } from "@/lib/studentFlow";
import {
  getCourseDayServer,
  getPublishedCourseBySlugServer,
  getQuestionsWithOptionsForDayServer,
  getUserDayResultServer,
  listUserAnswersForDayServer,
} from "@/services/studentContent.server";

export default async function CourseDayResultsPage({
  params,
}: {
  params: Promise<{ courseSlug: string; dayNumber: string }>;
}) {
  const { profile } = await requireStudent();
  const { courseSlug, dayNumber: rawDayNumber } = await params;
  const dayNumber = parseDayNumberParam(rawDayNumber);

  if (!profile) {
    return (
      <EmptyState
        title="Нужен е вход"
        description="Влез в MaturoHero, за да виждаш резултатите си."
        action={<NeonButton href="/login">Към входа</NeonButton>}
      />
    );
  }

  if (dayNumber === null) {
    return (
      <EmptyState
        title="Невалиден ден"
        description="Линкът към деня не е валиден."
        action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
      />
    );
  }

  const loadResult = await (async () => {
    const course = await getPublishedCourseBySlugServer(courseSlug);
    const bundle = await getCourseDayServer(courseSlug, dayNumber);
    if (!course || !bundle) {
      return {
        course,
        bundle,
        result: null,
        answers: [],
        questions: [] as Awaited<ReturnType<typeof getQuestionsWithOptionsForDayServer>>,
      };
    }

    const [result, answers, questions] = await Promise.all([
      getUserDayResultServer(profile.id, bundle.day.id),
      listUserAnswersForDayServer(profile.id, bundle.day.id),
      getQuestionsWithOptionsForDayServer(bundle.day.id, true),
    ]);

    return { course, bundle, result, answers, questions };
  })()
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => ({
      data: null,
      error: error instanceof Error ? error.message : "Възникна грешка.",
    }));

  if (loadResult.error) {
    return (
      <ErrorState
        title="Не успях да заредя резултата"
        description={loadResult.error}
        action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
      />
    );
  }

  if (!loadResult.data?.course || !loadResult.data.bundle) {
    return (
      <EmptyState
        title="Няма налично съдържание"
        description="Този ден още няма публикуван урок или задачи."
        action={<NeonButton href="/dashboard">Към таблото</NeonButton>}
      />
    );
  }

  if (!loadResult.data.result) {
    return (
      <EmptyState
        title="Още няма записан резултат"
        description="Завърши теста за деня и резултатът ти ще се появи тук."
      />
    );
  }

  return (
    <DayResultsSummary
      course={loadResult.data.course}
      bundle={loadResult.data.bundle}
      result={loadResult.data.result}
      answers={loadResult.data.answers}
      questions={loadResult.data.questions}
    />
  );
}
