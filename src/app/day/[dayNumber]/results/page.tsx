import { Star, Target, TriangleAlert } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreCard } from "@/components/ScoreCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { PageHeroHeader } from "@/components/ui/PageHeroHeader";
import { requireStudent } from "@/lib/auth/server";
import { getMiniTestQuestions } from "@/lib/questionGroups";
import { buildDayHref, buildLessonHref, buildQuizHref, parseDayNumberParam } from "@/lib/studentFlow";
import {
  getCourseDayByNumberServer,
  getDefaultPublishedCourseServer,
  getQuestionsWithOptionsForDayServer,
  getUserDayResultServer,
  listUserAnswersForDayServer,
} from "@/services/studentContent.server";

export default async function DayResultsPage({
  params,
}: {
  params: Promise<{ dayNumber: string }>;
}) {
  const { profile } = await requireStudent();
  const { dayNumber: rawDayNumber } = await params;
  const dayNumber = parseDayNumberParam(rawDayNumber);

  if (!profile) {
    return (
      <EmptyState
        title="Нужен е вход"
        description="Влез в MatHero, за да виждаш резултатите си."
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
    const course = await getDefaultPublishedCourseServer();
    const bundle = await getCourseDayByNumberServer(dayNumber);
    if (!course || !bundle) {
      return { course, bundle, result: null, answers: [], questions: [] as Awaited<ReturnType<typeof getQuestionsWithOptionsForDayServer>> };
    }

    const [result, answers, questions] = await Promise.all([
      getUserDayResultServer(profile.id, bundle.day.id),
      listUserAnswersForDayServer(profile.id, bundle.day.id),
      getQuestionsWithOptionsForDayServer(bundle.day.id, false).then((allQuestions) =>
        getMiniTestQuestions(allQuestions),
      ),
    ]);
    return { course, bundle, result, answers, questions };
  })()
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => ({ data: null, error: error instanceof Error ? error.message : "Възникна грешка." }));

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
        description="Този ден още няма публикуван урок или задача."
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

  const { course, bundle, result, answers, questions } = loadResult.data;
  const latestAnswersByQuestion = new Map<string, (typeof answers)[number]>();
  for (const answer of answers) {
    if (!latestAnswersByQuestion.has(answer.question_id)) {
      latestAnswersByQuestion.set(answer.question_id, answer);
    }
  }

  const wrongQuestions = questions.filter((question) => {
    const answer = latestAnswersByQuestion.get(question.id);
    return answer ? !answer.is_correct : false;
  });

  const nextDayHref =
    bundle.day.day_number < course.duration_days
      ? buildDayHref(course.slug, bundle.day.day_number + 1)
      : buildDayHref(course.slug, bundle.day.day_number);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <NeonCard padding="md">
          <PageHeroHeader
            label="РЕЗУЛТАТ ОТ ДЕНЯ"
            title={<h1 className="mh-heading-xl">{result.percentage >= 70 ? "Страхотна работа!" : "Продължавай смело!"}</h1>}
            action={<Badge tone="green">{bundle.day.title}</Badge>}
            description={
              result.percentage >= 70
                ? "Затвърди деня добре. Можеш да продължиш към следващия урок или да повториш трудните въпроси."
                : "Вече е ясно къде да натиснем още малко. Прегледай грешките и мини пак през теста."
            }
          />
        </NeonCard>

        <NeonCard padding="md">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-amber-300" />
            <p className="text-sm font-semibold text-white">Реален резултат от Supabase</p>
          </div>
          <p className="mt-4 text-4xl font-bold text-white">{result.percentage}%</p>
          <p className="mt-2 text-slate-400">
            {result.score} точки от {questions.reduce((sum, question) => sum + question.points, 0)}
          </p>
        </NeonCard>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <ScoreCard
          title="Резултат"
          value={`${result.percentage}%`}
          helper={`Ден ${bundle.day.day_number}`}
          accent="cyan"
          icon={<Target className="h-5 w-5" />}
        />
        <ScoreCard
          title="Грешки"
          value={`${wrongQuestions.length}`}
          helper={wrongQuestions.length === 0 ? "Без грешки" : "Теми за повторение"}
          accent="pink"
          icon={<TriangleAlert className="h-5 w-5" />}
        />
        <ScoreCard
          title="Слаби теми"
          value={`${result.weak_topics.length}`}
          helper={result.weak_topics.join(", ") || "Няма"}
          accent="lime"
          icon={<Star className="h-5 w-5" />}
        />
      </section>

      <ProgressBar
        label="Точност"
        value={result.percentage}
        max={100}
        helperText={`Верни отговори: ${questions.length - wrongQuestions.length}`}
        accent="lime"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <NeonCard padding="md">
          <h2 className="mh-heading-lg">Какво да преговориш</h2>
          <div className="mt-5 space-y-3">
            {wrongQuestions.length > 0 ? (
              wrongQuestions.map((question) => (
                <div key={question.id} className="rounded-[24px] border border-white/8 bg-white/5 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-rose-200">{question.topic}</p>
                  <p className="mt-3 text-white">{question.prompt}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{question.explanation}</p>
                </div>
              ))
            ) : (
              <p className="rounded-[24px] border border-white/8 bg-white/5 p-5 text-[1rem] leading-7 text-slate-200">
                Без грешки. Можеш спокойно да продължиш към следващия ден.
              </p>
            )}
          </div>
        </NeonCard>

        <NeonCard padding="sm" className="rounded-[26px]">
          <p className="text-sm text-slate-400">Слаби теми</p>
          <div className="mt-4 grid gap-3">
            {result.weak_topics.length > 0 ? (
              result.weak_topics.map((topic) => (
                <div
                  key={topic}
                  className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200"
                >
                  {topic}
                </div>
              ))
            ) : (
              <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                Няма откроени слаби теми.
              </div>
            )}
          </div>
        </NeonCard>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <NeonButton href={buildQuizHref(course.slug, bundle.day.day_number)} variant="secondary" className="flex-1">
          Повтори грешките
        </NeonButton>
        <NeonButton href={buildLessonHref(course.slug, bundle.day.day_number)} variant="ghost" className="flex-1">
          Върни се към урока
        </NeonButton>
        <NeonButton href={nextDayHref} className="flex-1">
          {bundle.day.day_number < course.duration_days ? "Към следващия ден" : "Към деня"}
        </NeonButton>
      </div>
    </div>
  );
}
