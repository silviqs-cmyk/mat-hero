"use client";

import { useMemo } from "react";
import { BookOpen, Star, Target, TriangleAlert } from "lucide-react";
import { MathText } from "@/components/math/MathText";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreCard } from "@/components/ScoreCard";
import { useDayProgress } from "@/hooks/useDayProgress";
import { resolveQuestionGroup } from "@/lib/questionGroups";
import { buildDayHref, buildLessonHref } from "@/lib/studentFlow";
import { buildLessonTopicHref, formatTopicLabel } from "@/lib/topicLabels";
import type { CourseWithDays, DayContentBundle, Question } from "@/types/course";
import type { DayResult, UserAnswer } from "@/types/user";
import { Badge } from "../ui/Badge";
import { NeonButton } from "../ui/NeonButton";
import { NeonCard } from "../ui/NeonCard";
import { PageHeroHeader } from "../ui/PageHeroHeader";

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
  const { progress } = useDayProgress(course.slug, bundle.day.day_number);

  const latestAnswersByQuestion = useMemo(() => {
    const map = new Map<string, UserAnswer>();

    for (const answer of answers) {
      if (!map.has(answer.question_id)) {
        map.set(answer.question_id, answer);
      }
    }

    return map;
  }, [answers]);

  const answeredQuestions = questions.filter((question) => latestAnswersByQuestion.has(question.id));
  const wrongQuestions = answeredQuestions.filter((question) => {
    const answer = latestAnswersByQuestion.get(question.id);
    return answer ? !answer.is_correct : false;
  });
  const correctAnswersCount = answeredQuestions.length - wrongQuestions.length;
  const resolvedPercentage =
    questions.length > 0 ? Math.round((correctAnswersCount / questions.length) * 100) : result.percentage;
  const weakTopicCounts = Array.from(
    wrongQuestions.reduce((map, question) => {
      const rawTopic = question.topic.trim();
      const normalizedTopic = rawTopic.toLocaleLowerCase("bg-BG").replace(/\s+/g, " ");
      const current = map.get(normalizedTopic) ?? {
        topic: rawTopic,
        displayTopic: formatTopicLabel(rawTopic),
        count: 0,
      };

      current.count += 1;
      map.set(normalizedTopic, current);
      return map;
    }, new Map<string, { topic: string; displayTopic: string; count: number }>()),
  )
    .map(([, value]) => value)
    .sort((left, right) => right.count - left.count || left.displayTopic.localeCompare(right.displayTopic, "bg-BG"));
  const topWeakTopicCounts = weakTopicCounts.slice(0, 5);
  const remainingWeakTopicsCount = Math.max(0, weakTopicCounts.length - topWeakTopicCounts.length);
  const wrongQuestionsPreview = wrongQuestions.slice(0, 5);
  const sectionStats = [
    { label: "ПРОВЕРИ", group: "quiz" as const },
    { label: "УПРАЖНИ", group: "practice" as const },
    { label: "ИЗПИТАЙ СЕ", group: "bonus" as const },
  ].map(({ label, group }) => {
    const sectionQuestions = questions.filter((question) => resolveQuestionGroup(question) === group);
    const correctAnswers = sectionQuestions.filter((question) => latestAnswersByQuestion.get(question.id)?.is_correct).length;

    return {
      label,
      totalQuestions: sectionQuestions.length,
      correctAnswers,
    };
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
            title={<h1 className="mh-heading-xl">{resolvedPercentage >= 70 ? "Страхотна работа!" : "Продължавай смело!"}</h1>}
            action={<Badge tone="green">{bundle.day.title}</Badge>}
            description={
              resolvedPercentage >= 70
                ? "Общият резултат е от задачи, тест и бонус. Теорията се отчита отделно като минат етап."
                : "Общият резултат е от задачи, тест и бонус. Прегледай грешките и мини пак през теорията при нужда."
            }
          />
        </NeonCard>

        <NeonCard padding="md">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-amber-300" />
            <p className="text-sm font-semibold text-white">Общ резултат за деня</p>
          </div>
          <p className="mt-4 text-2xl font-bold text-white">
            Верни отговори: {correctAnswersCount} от {questions.length}
          </p>
          <p className="mt-4 text-4xl font-bold text-white">{resolvedPercentage}%</p>
          <p className="mt-2 text-slate-400">Точност</p>
        </NeonCard>
      </section>

      <section className="grid gap-4 sm:grid-cols-4">
        <ScoreCard
          title="Теория"
          value={progress.theory ? "Да" : "Не"}
          helper={progress.theory ? "Урокът е минат" : "Урокът още не е минат"}
          accent="purple"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <ScoreCard
          title="Резултат"
          value={`${correctAnswersCount}/${questions.length}`}
          helper={`${resolvedPercentage}% точност`}
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
          value={remainingWeakTopicsCount > 0 ? "5+" : `${topWeakTopicCounts.length}`}
          helper={topWeakTopicCounts.length > 0 ? "Основни теми за преговор" : "Няма"}
          accent="lime"
          icon={<Star className="h-5 w-5" />}
        />
      </section>

      <ProgressBar
        label="Точност от задачи, тест и бонус"
        value={resolvedPercentage}
        max={100}
        helperText={`Верни отговори: ${correctAnswersCount} от ${questions.length}`}
        accent="lime"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sectionStats.map((section) => (
          <NeonCard key={section.label} padding="sm">
            <p className="text-sm font-semibold text-slate-300">{section.label}</p>
            <p className="mt-3 text-2xl font-bold text-white">
              {section.correctAnswers} от {section.totalQuestions}
            </p>
          </NeonCard>
        ))}
        <NeonCard padding="sm">
          <p className="text-sm font-semibold text-slate-300">Общо</p>
          <p className="mt-3 text-2xl font-bold text-white">
            {correctAnswersCount} от {questions.length}
          </p>
        </NeonCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <NeonCard padding="md">
          <h2 className="mh-heading-lg">Какво да преговориш</h2>
          <div className="mt-5 space-y-3">
            {weakTopicCounts.length > 0 ? (
              <>
                {topWeakTopicCounts.map((topicStat) => (
                  <div key={topicStat.topic} className="rounded-[24px] border border-white/8 bg-white/5 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-rose-200">
                      {topicStat.displayTopic}
                    </p>
                    <p className="mt-3 text-slate-300">
                      {topicStat.count} {topicStat.count === 1 ? "грешка" : "грешки"}
                    </p>
                  </div>
                ))}
                {remainingWeakTopicsCount > 0 ? (
                  <p className="rounded-[24px] border border-white/8 bg-white/5 p-5 text-sm leading-6 text-slate-300">
                    И още {remainingWeakTopicsCount} теми за преговор
                  </p>
                ) : null}

                <details className="rounded-[24px] border border-white/8 bg-white/5 p-5">
                  <summary className="cursor-pointer text-sm font-semibold text-white">
                    Виж конкретни задачи
                  </summary>
                  <div className="mt-4 space-y-3">
                    {wrongQuestionsPreview.map((question) => (
                      <div key={question.id} className="rounded-[20px] border border-white/8 bg-black/10 p-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-rose-200">
                          {formatTopicLabel(question.topic)}
                        </p>
                        <MathText text={question.prompt} className="mt-3 text-white" inlineFractions />
                        <MathText
                          text={question.explanation || "Преговори урока и опитай отново."}
                          className="mt-3 text-base leading-7 text-slate-300"
                          inlineFractions
                        />
                      </div>
                    ))}
                  </div>
                </details>
              </>
            ) : (
              <p className="rounded-[24px] border border-white/8 bg-white/5 p-5 text-base leading-7 text-slate-200">
                Нямаш грешки по задачите, теста и бонуса за този ден.
              </p>
            )}
          </div>
        </NeonCard>

        <NeonCard padding="sm" className="rounded-[26px]">
          <p className="text-sm text-slate-400">Слаби теми</p>
          <div className="mt-4 grid gap-3">
            {topWeakTopicCounts.length > 0 ? (
              <>
                {topWeakTopicCounts.map((topic) => (
                  <NeonButton
                    key={topic.topic}
                    href={buildLessonTopicHref(course.slug, bundle.day.day_number, topic.topic)}
                    variant="ghost"
                    className="min-h-12 w-full justify-start rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200"
                  >
                    {topic.displayTopic}
                  </NeonButton>
                ))}
                {remainingWeakTopicsCount > 0 ? (
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                    И още {remainingWeakTopicsCount} теми за преговор
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                Няма откроени слаби теми.
              </div>
            )}
          </div>
        </NeonCard>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <NeonButton href={buildLessonHref(course.slug, bundle.day.day_number)} variant="secondary" className="flex-1">
          Повтори деня
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
