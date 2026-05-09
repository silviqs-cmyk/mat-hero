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
import { resolveQuestionGroup } from "@/lib/questionGroups";
import {
  buildBonusHref,
  buildDayHref,
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

type FlowMode = "practice" | "quiz" | "bonus";

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

function getFlowCopy(mode: FlowMode) {
  if (mode === "quiz") {
    return {
      header: "Тест за деня",
      progressLabel: "Напредък в теста",
      progressHelper: "Всеки верен отговор носи точки.",
      mascotMessage: "Мини през теста спокойно. След всеки отговор ще виждаш обратната връзка в popup.",
    };
  }

  if (mode === "bonus") {
    return {
      header: "Бонус задачи",
      progressLabel: "Напредък в бонуса",
      progressHelper: "Ползвай бонус задачите за още увереност.",
      mascotMessage: "Това са допълнителни задачи. След всеки отговор ще виждаш обратната връзка в popup.",
    };
  }

  return {
    header: "Основни задачи",
    progressLabel: "Напредък в задачите",
    progressHelper: "Фокус върху правилния подход.",
    mascotMessage: "Решавай задачите една по една. След всеки отговор ще виждаш обратната връзка в popup.",
  };
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
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState<AnswerRecord | null>(null);

  const currentQuestion = questions[currentIndex];
  const currentOptions = useMemo(() => (currentQuestion ? buildQuestionOptions(currentQuestion) : []), [currentQuestion]);
  const flowCopy = getFlowCopy(mode);
  const safeProgressLabel = flowCopy.progressLabel ?? "";
  const safeProgressHelper = flowCopy.progressHelper ?? "";
  const totalQuestions = questions.length;
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
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const hasQuizQuestions = bundle.questions.some((question) => resolveQuestionGroup(question) === "quiz");
  const hasBonusQuestions = bundle.questions.some((question) => resolveQuestionGroup(question) === "bonus");
  const answerRecords = useMemo(() => {
    if (!lastSubmittedAnswer) {
      return answers;
    }

    return answers.some((answer) => answer.questionId === lastSubmittedAnswer.questionId)
      ? answers
      : [...answers, lastSubmittedAnswer];
  }, [answers, lastSubmittedAnswer]);
  const showsCompletionState = isLastQuestion && mode !== "practice";
  const feedbackState = showsCompletionState ? "completed" : isCorrect ? "correct" : "incorrect";
  const completionHref =
    mode === "practice"
      ? hasQuizQuestions
        ? buildQuizHref(course.slug, bundle.day.day_number)
        : hasBonusQuestions
          ? buildBonusHref(course.slug, bundle.day.day_number)
          : buildDayHref(course.slug, bundle.day.day_number)
      : mode === "quiz" && hasBonusQuestions
        ? buildBonusHref(course.slug, bundle.day.day_number)
        : buildResultsHref(course.slug, bundle.day.day_number);
  const primaryLabel = isLastQuestion
    ? mode === "practice"
      ? hasQuizQuestions
        ? "Към теста"
        : hasBonusQuestions
          ? "Към бонуса"
          : "Към деня"
      : mode === "quiz" && hasBonusQuestions
        ? "Към бонуса"
        : "Виж резултата"
    : "Следващ въпрос";

  useLayoutEffect(() => {
    setTopBarProgress({
      label: safeProgressLabel,
      summary: `${currentIndex + 1} / ${totalQuestions} въпроса`,
      helper: safeProgressHelper,
      value: currentIndex + 1,
      max: totalQuestions,
      tone: mode === "practice" ? "cyan" : "lime",
    });

    return () => {
      setTopBarProgress(null);
    };
  }, [currentIndex, safeProgressHelper, safeProgressLabel, mode, totalQuestions, setTopBarProgress]);

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
      setLastSubmittedAnswer(answerRecord);
      setShowFeedback(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleContinue() {
    if (!currentQuestion || saving) {
      return;
    }

    if (!isLastQuestion) {
      setCurrentIndex((index) => index + 1);
      setSelectedOptionId(null);
      setAnswerText("");
      setLastSubmittedAnswer(null);
      setShowFeedback(false);
      return;
    }

    if (mode === "practice" || mode === "bonus") {
      router.push(completionHref);
      return;
    }

    const totalAnsweredQuestions = answerRecords.length;
    const earnedPoints = answerRecords.reduce((sum, answer) => sum + answer.pointsEarned, 0);
    const totalPossiblePoints = questions.reduce((sum, question) => sum + question.points, 0);
    const percentage = totalPossiblePoints > 0 ? Math.round((earnedPoints / totalPossiblePoints) * 100) : 0;
    const weakTopics = Array.from(
      new Set(answerRecords.filter((answer) => !answer.isCorrect).map((answer) => answer.topic).filter(Boolean)),
    ).slice(0, 4);
    const completedDays = Array.from(new Set([...(progress?.completed_days ?? []), bundle.day.day_number])).sort(
      (left, right) => left - right,
    );
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
          total_questions: totalAnsweredQuestions,
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

      router.push(completionHref);
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
          label={flowCopy.header}
          title={<h2 className="mh-heading-lg">{bundle.day.title}</h2>}
          action={<Badge tone="cyan">{currentIndex + 1} / {totalQuestions} въпроса</Badge>}
        />
        <p className="mh-copy-muted mt-2">Тема: {currentQuestion.topic}</p>
      </NeonCard>

      <MascotCharacter
        mood="idle"
        message={flowCopy.mascotMessage}
        xpText={mode === "quiz" ? "+25 XP при завършен тест" : undefined}
      />

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <NeonCard as="article" padding="md" className="lg:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mh-label">ВЪПРОС {currentIndex + 1}/{totalQuestions}</p>
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
                  showFeedback={false}
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
          <div className="mt-5 rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
            <p className="mh-copy text-slate-300">
              {currentQuestion.question_type === "open_answer"
                ? "При свободен отговор мини спокойно през пресмятането и въведи крайния резултат."
                : "Прочети всички варианти и избери този, който можеш да защитиш с решение."}
            </p>
          </div>
        </NeonCard>
      </section>

      <AnswerFeedbackModal
        isOpen={showFeedback}
        state={feedbackState}
        isCorrect={isCorrect}
        explanation={currentQuestion.explanation}
        correctAnswer={resolvedCorrectAnswer}
        pointsEarned={isCorrect ? currentQuestion.points : 0}
        primaryLabel={primaryLabel}
        onContinue={() => void handleContinue()}
      />
    </div>
  );
}
