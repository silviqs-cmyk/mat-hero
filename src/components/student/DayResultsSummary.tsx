import { Star, Target, TriangleAlert } from "lucide-react";
import { FormattedMathText } from "@/components/math/FormattedMathText";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreCard } from "@/components/ScoreCard";
import { Badge } from "@/components/ui/Badge";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { PageHeroHeader } from "@/components/ui/PageHeroHeader";
import { buildDayHref, buildLessonHref, buildQuizHref } from "@/lib/studentFlow";
import { buildLessonTopicHref, formatTopicLabel } from "@/lib/topicLabels";
import type { CourseWithDays, DayContentBundle, Question } from "@/types/course";
import type { DayResult, UserAnswer } from "@/types/user";

interface DayResultsSummaryProps {
  course: CourseWithDays;
  bundle: DayContentBundle;
  result: DayResult;
  answers: UserAnswer[];
  questions: Question[];
}

export function DayResultsSummary({
  course,
  bundle,
  result,
  answers,
  questions,
}: DayResultsSummaryProps) {
  const latestAnswersByQuestion = new Map<string, UserAnswer>();
  for (const answer of answers) {
    if (!latestAnswersByQuestion.has(answer.question_id)) {
      latestAnswersByQuestion.set(answer.question_id, answer);
    }
  }

  const wrongQuestions = questions.filter((question) => {
    const answer = latestAnswersByQuestion.get(question.id);
    return answer ? !answer.is_correct : false;
  });

  const totalPossiblePoints = questions.reduce((sum, question) => sum + question.points, 0);
  const correctAnswersCount = Math.max(0, questions.length - wrongQuestions.length);
  const weakTopics = result.weak_topics.filter((topic) => topic.trim().length > 0);
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
                ? "Затвърди материала добре. Можеш да продължиш към следващия ден или да повториш по-трудните въпроси."
                : "Вече е ясно къде имаш нужда от още малко работа. Прегледай грешките и после мини пак през урока и теста."
            }
          />
        </NeonCard>

        <NeonCard padding="md">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-amber-300" />
            <p className="text-sm font-semibold text-white">Записан резултат</p>
          </div>
          <p className="mt-4 text-4xl font-bold text-white">{result.percentage}%</p>
          <p className="mt-2 text-slate-400">
            {result.score} точки от {totalPossiblePoints}
          </p>
          <p className="mt-1 text-sm text-slate-500">{result.total_questions} въпроса</p>
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
          helper={wrongQuestions.length === 0 ? "Без грешки" : "Има теми за преговор"}
          accent="pink"
          icon={<TriangleAlert className="h-5 w-5" />}
        />
        <ScoreCard
          title="Слаби теми"
          value={`${weakTopics.length}`}
          helper={weakTopics.map(formatTopicLabel).join(", ") || "Няма"}
          accent="lime"
          icon={<Star className="h-5 w-5" />}
        />
      </section>

      <ProgressBar
        label="Точност"
        value={result.percentage}
        max={100}
        helperText={`Верни отговори: ${correctAnswersCount} от ${questions.length}`}
        accent="lime"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <NeonCard padding="md">
          <h2 className="mh-heading-lg">Какво да преговориш</h2>
          <div className="mt-5 space-y-3">
            {wrongQuestions.length > 0 ? (
              wrongQuestions.map((question) => (
                <div key={question.id} className="rounded-[24px] border border-white/8 bg-white/5 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-rose-200">
                    {formatTopicLabel(question.topic)}
                  </p>
                  <FormattedMathText text={question.prompt} className="mt-3 text-white" />
                  <FormattedMathText text={question.explanation || "Преговори урока и опитай отново."} className="mt-3 text-sm leading-6 text-slate-300" />
                </div>
              ))
            ) : (
              <p className="rounded-[24px] border border-white/8 bg-white/5 p-5 text-[1rem] leading-7 text-slate-200">
                Нямаш грешки на този тест. Можеш спокойно да продължиш към следващия ден.
              </p>
            )}
          </div>
        </NeonCard>

        <NeonCard padding="sm" className="rounded-[26px]">
          <p className="text-sm text-slate-400">Слаби теми</p>
          <div className="mt-4 grid gap-3">
            {weakTopics.length > 0 ? (
              weakTopics.map((topic) => (
                <NeonButton
                  key={topic}
                  href={buildLessonTopicHref(course.slug, bundle.day.day_number, topic)}
                  variant="ghost"
                  className="min-h-12 w-full justify-start rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200"
                >
                  {formatTopicLabel(topic)}
                </NeonButton>
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
          Повтори теста
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
