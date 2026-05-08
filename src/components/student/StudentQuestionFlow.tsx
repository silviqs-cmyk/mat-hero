"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnswerOption } from "@/components/AnswerOption";
import { MascotCharacter } from "@/components/MascotCharacter";
import { useTopBarProgress } from "@/components/providers/TopBarProgressProvider";
import { AnswerFeedbackModal } from "@/components/quiz/AnswerFeedbackModal";
import { Badge } from "@/components/ui/Badge";
import { FormInput } from "@/components/ui/FormInput";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  buildQuizHref,
  buildResultsHref,
  evaluateQuestionAnswer,
  getResolvedCorrectAnswer,
  normalizeAnswer,
} from "@/lib/studentFlow";
import { saveUserAnswer } from "@/services/questions";
import { upsertUserCourseProgress } from "@/services/progress";
import { saveDayResult } from "@/services/results";
import type { CourseWithDays, DayContentBundle, Question } from "@/types/course";
import type { UserProfile, UserProgress } from "@/types/user";

type FlowMode = "practice" | "quiz";

interface StudentQuestionFlowProps {
  mode: FlowMode;
  course: CourseWithDays;
  bundle: DayContentBundle;
  questions: Question[];
  profile: UserProfile;
  progress: UserProgress | null;
}

interface AnswerRecord {
  questionId: string;
  topic: string;
  isCorrect: boolean;
  selectedOptionId: string | null;
  answerText: string;
  pointsEarned: number;
}

function buildQuestionOptions(question: Question) {
  if (question.question_type === "true_false" && (!question.options || question.options.length === 0)) {
    return [
      { id: "true", option_text: "Вярно", is_correct: normalizeAnswer(question.expected_answer ?? "") === "вярно" },
      { id: "false", option_text: "Невярно", is_correct: normalizeAnswer(question.expected_answer ?? "") === "невярно" },
    ];
  }

  return question.options ?? [];
}

export function StudentQuestionFlow({
  mode,
  course,
  bundle,
  questions,
  profile,
  progress,
}: StudentQuestionFlowProps) {
  const router = useRouter();
  const { setProgress: setTopBarProgress } = useTopBarProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  const currentQuestion = questions[currentIndex];
  const currentOptions = useMemo(
    () => (currentQuestion ? buildQuestionOptions(currentQuestion) : []),
    [currentQuestion],
  );
  const submittedAnswer =
    currentQuestion?.question_type === "open_answer"
      ? answerText
      : currentOptions.find((option) => option.id === selectedOptionId)?.option_text ?? "";
  const resolvedCorrectAnswer = currentQuestion
    ? getResolvedCorrectAnswer({ ...currentQuestion, options: currentOptions })
    : null;
  const isCorrect = currentQuestion
    ? evaluateQuestionAnswer({ ...currentQuestion, options: currentOptions }, submittedAnswer)
    : false;
  const usesModalFeedback = mode === "quiz";
  const showInlineFeedback = showFeedback && !usesModalFeedback;

  useLayoutEffect(() => {
    setTopBarProgress({
      label: mode === "practice" ? "Напредък в задачите" : "Напредък в теста",
      summary: `${currentIndex + 1} / ${questions.length} въпроса`,
      helper:
        mode === "practice"
          ? "Фокус върху правилния подход."
          : "Всеки верен отговор носи точки.",
      value: currentIndex,
      max: questions.length,
      tone: mode === "practice" ? "cyan" : "lime",
    });

    return () => {
      setTopBarProgress(null);
    };
  }, [currentIndex, mode, questions.length, setTopBarProgress]);

  async function handleSubmit() {
    if (!currentQuestion || saving || showFeedback) {
      return;
    }

    if (currentQuestion.question_type === "open_answer" && answerText.trim().length === 0) {
      return;
    }

    if (currentQuestion.question_type !== "open_answer" && !selectedOptionId) {
      return;
    }

    setSaving(true);
    try {
      const answerRecord = {
        questionId: currentQuestion.id,
        topic: currentQuestion.topic,
        isCorrect,
        selectedOptionId,
        answerText: submittedAnswer,
        pointsEarned: isCorrect ? currentQuestion.points : 0,
      } satisfies AnswerRecord;

      await saveUserAnswer({
        userId: profile.id,
        questionId: currentQuestion.id,
        selectedOptionId,
        openAnswer: currentQuestion.question_type === "open_answer" ? answerText : null,
        isCorrect: answerRecord.isCorrect,
        pointsEarned: answerRecord.pointsEarned,
      });

      setAnswers((previous) => [...previous, answerRecord]);
      setShowFeedback(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleContinue() {
    if (!currentQuestion || saving) {
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1);
      setSelectedOptionId(null);
      setAnswerText("");
      setShowFeedback(false);
      return;
    }

    if (mode === "practice") {
      router.push(buildQuizHref(course.slug, bundle.day.day_number));
      return;
    }

    const totalQuestions = answers.length;
    const earnedPoints = answers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
    const totalPossiblePoints = questions.reduce((sum, question) => sum + question.points, 0);
    const percentage = totalPossiblePoints > 0 ? Math.round((earnedPoints / totalPossiblePoints) * 100) : 0;
    const weakTopics = Array.from(
      new Set(answers.filter((answer) => !answer.isCorrect).map((answer) => answer.topic).filter(Boolean)),
    ).slice(0, 4);
    const completedDays = Array.from(
      new Set([...(progress?.completed_days ?? []), bundle.day.day_number]),
    ).sort((left, right) => left - right);
    const currentDayNumber = Math.min(
      course.duration_days,
      Math.max(progress?.current_day_number ?? 1, bundle.day.day_number + 1),
    );

    setSaving(true);
    try {
      await Promise.all([
        saveDayResult({
          user_id: profile.id,
          course_day_id: bundle.day.id,
          score: earnedPoints,
          total_questions: totalQuestions,
          percentage,
          weak_topics: weakTopics,
          completed_at: new Date().toISOString(),
        }),
        upsertUserCourseProgress({
          user_id: profile.id,
          course_id: course.id,
          current_day_number: currentDayNumber,
          completed_days: completedDays,
          total_xp: (progress?.total_xp ?? 0) + earnedPoints + 25,
          streak_days: (progress?.streak_days ?? 0) + 1,
          last_active_at: new Date().toISOString(),
        }),
      ]);

      router.push(buildResultsHref(course.slug, bundle.day.day_number));
    } finally {
      setSaving(false);
    }
  }

  if (!currentQuestion) {
    return null;
  }

  const buttonDisabled =
    saving ||
    (currentQuestion.question_type === "open_answer" ? answerText.trim().length === 0 : !selectedOptionId);

  function handleEnterSubmit() {
    if (showFeedback || buttonDisabled) {
      return;
    }

    void handleSubmit();
  }

  return (
    <div
      className="mx-auto max-w-6xl space-y-5"
      onKeyDown={(event) => {
        if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
          return;
        }

        if (showFeedback) {
          return;
        }

        const target = event.target as HTMLElement | null;
        if (target?.tagName === "TEXTAREA") {
          return;
        }

        event.preventDefault();
        handleEnterSubmit();
      }}
    >
      <NeonCard padding="sm">
        <SectionHeader
          label={mode === "practice" ? "Упражнение" : "Тест за деня"}
          title={<h2 className="mh-heading-lg">{bundle.day.title}</h2>}
          action={<Badge tone="cyan">{currentIndex + 1} / {questions.length} въпроса</Badge>}
        />
        <p className="mh-copy-muted mt-2">Тема: {currentQuestion.topic}</p>
      </NeonCard>

      <MascotCharacter
        mood={showInlineFeedback && isCorrect ? "celebrating" : showInlineFeedback ? "happy" : "idle"}
        title={showInlineFeedback ? (isCorrect ? "Точно така!" : "Имаш следващ шанс") : undefined}
        message={
          showInlineFeedback
            ? currentQuestion.explanation
            : mode === "practice"
              ? "Решавай задачите една по една и гледай обясненията веднага след всеки отговор."
              : "Мини през теста спокойно. След всеки въпрос обратната връзка ще излиза в popup."
        }
        xpText={mode === "quiz" ? "+25 XP при завършен тест" : undefined}
      />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <NeonCard as="article" padding="md" className="lg:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mh-label">ВЪПРОС {currentIndex + 1}/{questions.length}</p>
              <Badge tone="purple" className="mt-3">
                {currentQuestion.difficulty}
              </Badge>
            </div>
          </div>

          <h2 className="mt-5 font-display text-[1.7rem] leading-8 text-white lg:text-[2rem] lg:leading-10">
            {currentQuestion.prompt}
          </h2>

          {currentQuestion.question_type === "open_answer" ? (
            <div className="mt-6">
              <FormInput
                value={answerText}
                onChange={(event) => setAnswerText(event.currentTarget.value)}
                placeholder="Напиши отговора си"
                disabled={showFeedback || saving}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
                    return;
                  }

                  event.preventDefault();
                  handleEnterSubmit();
                }}
              />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {currentOptions.map((option, optionIndex) => (
                <AnswerOption
                  key={option.id}
                  optionId={String.fromCharCode(65 + optionIndex)}
                  optionText={option.option_text}
                  isSelected={selectedOptionId === option.id}
                  isCorrect={Boolean(option.is_correct)}
                  showFeedback={showInlineFeedback}
                  onClick={() => {
                    if (!showFeedback && !saving) {
                      setSelectedOptionId(option.id);
                    }
                  }}
                />
              ))}
            </div>
          )}

          {!showFeedback ? (
            <div className="mt-6">
              <NeonButton type="button" onClick={() => void handleSubmit()} disabled={buttonDisabled}>
                {saving ? "Запазване..." : "Провери отговора"}
              </NeonButton>
            </div>
          ) : null}
        </NeonCard>

        <NeonCard padding="sm" className="bg-[rgb(1,1,2)] lg:p-6">
          <p className="mh-label">Обратна връзка</p>

          {showInlineFeedback ? (
            <>
              <div
                className={`mt-4 rounded-[24px] p-4 lg:p-5 ${
                  isCorrect
                    ? "border border-cyan-400/20 bg-cyan-400/5"
                    : "border border-rose-400/20 bg-rose-400/5"
                }`}
              >
                <h3
                  className={`font-display text-2xl leading-tight lg:text-[1.8rem] ${
                    isCorrect ? "text-cyan-100" : "text-rose-300"
                  }`}
                >
                  {isCorrect ? "Точен отговор." : "Тук има какво да затвърдим."}
                </h3>
                <p className="mh-copy-muted mt-3">{currentQuestion.explanation}</p>
                {!isCorrect && resolvedCorrectAnswer ? (
                  <p className="mt-3 text-sm font-semibold text-white">Верен отговор: {resolvedCorrectAnswer}</p>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <NeonButton type="button" onClick={() => void handleContinue()} disabled={saving}>
                  {currentIndex < questions.length - 1
                    ? "Следващ въпрос"
                    : mode === "practice"
                      ? "Към теста"
                      : "Виж резултата"}
                </NeonButton>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <p className="mh-copy text-slate-300">
                {currentQuestion.question_type === "open_answer"
                  ? "При свободен отговор мини спокойно през пресмятането и въведи крайния резултат."
                  : "Прочети всички варианти и избери този, който можеш да защитиш с решение."}
              </p>
            </div>
          )}
        </NeonCard>
      </section>

      <AnswerFeedbackModal
        isOpen={usesModalFeedback && showFeedback}
        isCorrect={isCorrect}
        explanation={currentQuestion.explanation}
        correctAnswer={resolvedCorrectAnswer}
        isLastQuestion={currentIndex === questions.length - 1}
        onContinue={() => void handleContinue()}
      />
    </div>
  );
}
