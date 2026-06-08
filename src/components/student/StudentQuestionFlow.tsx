"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnswerOption } from "@/components/AnswerOption";
import { MathText } from "@/components/math/MathText";
import { MascotCharacter } from "@/components/MascotCharacter";
import { AnswerFeedbackModal } from "@/components/quiz/AnswerFeedbackModal";
import { DayTopBarProgress } from "@/components/student/DayTopBarProgress";
import { QuestionFeedbackPreview } from "@/components/student/QuestionFeedbackPreview";
import { Badge } from "@/components/ui/Badge";
import { FormInput } from "@/components/ui/FormInput";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatAskMatExplanation } from "@/lib/askMat";
import { getBonusQuestions, getPracticeQuestions } from "@/lib/questionGroups";
import { buildLessonTopicHref, formatTopicLabel } from "@/lib/topicLabels";
import {
  buildBonusHref,
  buildPracticeHref,
  buildResultsHref,
  evaluateQuestionAnswer,
  getMultiPartAnswerSpec,
  getResolvedCorrectAnswer,
  normalizeAnswer,
  serializeMultiPartAnswer,
} from "@/lib/studentFlow";
import { listUserAnswersForDay, saveUserAnswer } from "@/services/questions";
import { upsertUserCourseProgress } from "@/services/progress";
import { getUserDayResult, saveDayResult } from "@/services/results";
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

interface SubmitOverrides {
  selectedOptionId?: string | null;
  answerText?: string;
}

const DEFAULT_FEEDBACK_PANEL_TEXT =
  "\u041f\u0440\u043e\u0447\u0435\u0442\u0438 \u0432\u0441\u0438\u0447\u043a\u0438 \u0432\u0430\u0440\u0438\u0430\u043d\u0442\u0438 \u0438 \u0438\u0437\u0431\u0435\u0440\u0438 \u0442\u043e\u0437\u0438, \u043a\u043e\u0439\u0442\u043e \u043c\u043e\u0436\u0435\u0448 \u0434\u0430 \u0437\u0430\u0449\u0438\u0442\u0438\u0448 \u0441 \u0440\u0435\u0448\u0435\u043d\u0438\u0435.";

const PRACTICE_FEEDBACK_PANEL_TEXT =
  "\u270d\ufe0f \u0412\u0437\u0435\u043c\u0438 \u043b\u0438\u0441\u0442 \u0438 \u0445\u0438\u043c\u0438\u043a\u0430\u043b.\n\n\u0422\u0430\u0437\u0438 \u0437\u0430\u0434\u0430\u0447\u0430 \u0435 \u0437\u0430 \u043f\u0438\u0441\u043c\u0435\u043d\u043e \u0440\u0435\u0448\u0430\u0432\u0430\u043d\u0435 \u2014 \u0441\u043c\u0435\u0442\u043d\u0438 \u0441\u0442\u044a\u043f\u043a\u0438\u0442\u0435 \u0438 \u0447\u0430\u043a \u0442\u043e\u0433\u0430\u0432\u0430 \u0438\u0437\u0431\u0435\u0440\u0438 \u043e\u0442\u0433\u043e\u0432\u043e\u0440.";

const EXAM_FEEDBACK_PANEL_TEXT =
  "\ud83d\udcdd \u0420\u0435\u0448\u0430\u0432\u0430\u0439 \u043a\u0430\u0442\u043e \u043d\u0430 \u0438\u0441\u0442\u0438\u043d\u0441\u043a\u043e \u041d\u0412\u041e.\n\n\u0417\u0430\u043f\u0438\u0448\u0438 \u0440\u0435\u0448\u0435\u043d\u0438\u0435\u0442\u043e \u043d\u0430 \u043b\u0438\u0441\u0442, \u043f\u0440\u043e\u0432\u0435\u0440\u0438 \u0441\u0442\u044a\u043f\u043a\u0438\u0442\u0435 \u0438 \u0447\u0430\u043a \u0442\u043e\u0433\u0430\u0432\u0430 \u0438\u0437\u0431\u0435\u0440\u0438 \u043e\u0442\u0433\u043e\u0432\u043e\u0440.";

const OPEN_ANSWER_FEEDBACK_PANEL_TEXT =
  "\u270d\ufe0f \u0412\u0437\u0435\u043c\u0438 \u043b\u0438\u0441\u0442 \u0438 \u0445\u0438\u043c\u0438\u043a\u0430\u043b.\n\n\u0417\u0430\u043f\u0438\u0448\u0438 \u0440\u0435\u0448\u0435\u043d\u0438\u0435\u0442\u043e \u0441\u0438 \u0441\u0442\u044a\u043f\u043a\u0430 \u043f\u043e \u0441\u0442\u044a\u043f\u043a\u0430, \u0441\u043b\u0435\u0434 \u0442\u043e\u0432\u0430 \u0432\u044a\u0432\u0435\u0434\u0438 \u043a\u0440\u0430\u0439\u043d\u0438\u044f \u043e\u0442\u0433\u043e\u0432\u043e\u0440.";

function buildQuestionOptions(question: Question) {
  if (question.question_type === "true_false" && (!question.options || question.options.length === 0)) {
    return [
      {
        id: "true",
        option_text: "Вярно",
        is_correct: normalizeAnswer(question.expected_answer ?? "") === "вярно",
      },
      {
        id: "false",
        option_text: "Невярно",
        is_correct: normalizeAnswer(question.expected_answer ?? "") === "невярно",
      },
    ];
  }

  return question.options ?? [];
}

function isOpenAnswerQuestion(question: Pick<Question, "question_type"> | null | undefined) {
  return question?.question_type === "open_answer";
}

function getFeedbackPanelText(sectionType: string | null | undefined, isOpenAnswer: boolean) {
  if (isOpenAnswer) {
    return OPEN_ANSWER_FEEDBACK_PANEL_TEXT;
  }

  if (sectionType === "practice") {
    return PRACTICE_FEEDBACK_PANEL_TEXT;
  }

  if (sectionType === "bonus" || sectionType === "exam") {
    return EXAM_FEEDBACK_PANEL_TEXT;
  }

  if (sectionType === "quiz") {
    return DEFAULT_FEEDBACK_PANEL_TEXT;
  }

  return DEFAULT_FEEDBACK_PANEL_TEXT;
}

function getFeedbackPanelVisual(sectionType: string | null | undefined, isOpenAnswer: boolean) {
  if (isOpenAnswer || sectionType === "practice") {
    return {
      src: "/images/feedback/penandpapper.png",
      alt: "Лист и химикал",
    };
  }

  if (sectionType === "bonus" || sectionType === "exam") {
    return {
      src: "/images/feedback/nvo.png",
      alt: "НВО задача",
    };
  }

  return null;
}

function getFlowCopy(mode: FlowMode) {
  if (mode === "quiz") {
    return {
      header: "Тест за деня",
      mascotMessage:
        "Мини през теста спокойно. След всеки отговор ще виждаш обратна връзка в popup.",
    };
  }

  if (mode === "bonus") {
    return {
      header: "Изпитай се",
      mascotMessage:
        "Реални задачи от НВО. След всеки отговор ще виждаш обратна връзка и решение.",
    };
  }

  return {
    header: "Упражни",
    mascotMessage:
      "Решавай задачите една по една. След всеки отговор ще виждаш обратна връзка в popup.",
  };
}

function getDifficultyLabel(difficulty: Question["difficulty"]) {
  if (difficulty === "easy") {
    return "Лесна";
  }
  if (difficulty === "hard") {
    return "Трудна";
  }
  return "Средна";
}

function getNextRouteAfterSection(
  mode: FlowMode,
  courseSlug: string,
  dayNumber: number,
  hasPracticeQuestions: boolean,
  hasBonusQuestions: boolean,
) {
  if (mode === "quiz") {
    if (hasPracticeQuestions) {
      return buildPracticeHref(courseSlug, dayNumber);
    }

    if (hasBonusQuestions) {
      return buildBonusHref(courseSlug, dayNumber);
    }

    return buildResultsHref(courseSlug, dayNumber);
  }

  if (mode === "practice") {
    return hasBonusQuestions ? buildBonusHref(courseSlug, dayNumber) : buildResultsHref(courseSlug, dayNumber);
  }

  return buildResultsHref(courseSlug, dayNumber);
}

export function StudentQuestionFlow({
  mode,
  course,
  bundle,
  questions,
  profile,
  progress,
}: StudentQuestionFlowProps) {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [multiPartAnswers, setMultiPartAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState<AnswerRecord | null>(null);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [showWrongAnswerPreview, setShowWrongAnswerPreview] = useState(false);
  const submissionLockRef = useRef(false);
  const submittedQuestionIdsRef = useRef<Set<string>>(new Set());
  const continueLockRef = useRef(false);
  const continuedQuestionIdsRef = useRef<Set<string>>(new Set());
  const postContinueGuardUntilRef = useRef(0);

  const currentQuestion = questions[currentIndex];
  const currentOptions = useMemo(
    () => (currentQuestion ? buildQuestionOptions(currentQuestion) : []),
    [currentQuestion],
  );
  const isOpenAnswer = isOpenAnswerQuestion(currentQuestion);
  const multiPartSpec = currentQuestion ? getMultiPartAnswerSpec(currentQuestion) : null;
  const isMultiPartOpenAnswer = Boolean(multiPartSpec);
  const multiPartFields = multiPartSpec?.fields ?? [];
  const feedbackPanelText = getFeedbackPanelText(currentQuestion?.question_group ?? mode, isOpenAnswer);
  const feedbackPanelVisual = getFeedbackPanelVisual(currentQuestion?.question_group ?? mode, isOpenAnswer);
  const flowCopy = getFlowCopy(mode);
  const totalQuestions = questions.length;
  const questionIdsSignature = useMemo(() => questions.map((question) => question.id).join("|"), [questions]);
  const submittedAnswer =
    isOpenAnswer
      ? multiPartSpec
        ? serializeMultiPartAnswer(multiPartSpec, multiPartAnswers)
        : answerText
      : currentOptions.find((option) => option.id === selectedOptionId)?.option_text ?? "";
  const resolvedCorrectAnswer = currentQuestion
    ? getResolvedCorrectAnswer({ ...currentQuestion, options: currentOptions })
    : null;
  const askMatExplanation = currentQuestion
    ? formatAskMatExplanation({
        mode,
        question: currentQuestion,
        correctAnswer: resolvedCorrectAnswer,
        options: currentOptions,
      })
    : "";
  const isCorrect = currentQuestion
    ? evaluateQuestionAnswer(
        { ...currentQuestion, options: currentOptions },
        submittedAnswer,
        selectedOptionId,
      )
    : false;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const hasPracticeQuestions = getPracticeQuestions(bundle.questions).length > 0;
  const hasBonusQuestions = getBonusQuestions(bundle.questions).length > 0;
  const feedbackState = isCorrect ? "correct" : "incorrect";
  const nextRoute = getNextRouteAfterSection(
    mode,
    course.slug,
    bundle.day.day_number,
    hasPracticeQuestions,
    hasBonusQuestions,
  );
  const resultsHref = buildResultsHref(course.slug, bundle.day.day_number);
  const isFinalSection =
    mode === "bonus" ||
    (mode === "practice" && !hasBonusQuestions) ||
    (mode === "quiz" && !hasPracticeQuestions && !hasBonusQuestions);
  const nextDayNumber =
    bundle.day.day_number < course.duration_days ? bundle.day.day_number + 1 : null;
  const completedTitle = isLastQuestion
    ? isFinalSection
      ? "Денят е завършен!"
      : "Секцията е завършена!"
    : null;
  const completedMessage = isLastQuestion
    ? isFinalSection
      ? "Супер работа. Продължи към резултата и после мини към следващия ден."
      : mode === "quiz"
        ? hasPracticeQuestions
          ? "Мини към упражненията, за да затвърдиш урока."
          : hasBonusQuestions
            ? "Мини към Изпитай се за още 10 задачи."
            : "Продължи към резултата си."
        : "Продължи към следващата стъпка."
    : null;
  const completedHint = isLastQuestion && isFinalSection
    ? nextDayNumber
      ? `Следващ ден: Ден ${nextDayNumber}`
      : "Следва: Финален резултат"
    : null;
  const completedMascotGifSrc = isLastQuestion && isFinalSection
    ? "/images/feedback/day-finished-hero.gif"
    : null;
  const resolvedPrimaryLabel = isLastQuestion
    ? mode === "quiz"
      ? hasPracticeQuestions
        ? "Към упражненията"
        : hasBonusQuestions
          ? "Към Изпитай се"
          : "Виж резултата"
      : mode === "practice"
        ? hasBonusQuestions
          ? "Към Изпитай се"
          : "Виж резултата"
        : "Виж резултата"
    : "Следваща задача";
  const showAskMatInFeedback =
    showFeedback &&
    Boolean(currentQuestion?.explanation?.trim() || resolvedCorrectAnswer?.trim()) &&
    (mode === "bonus" || !isCorrect);
  const shouldShowWrongAnswerState = showFeedback && !isCorrect;
  const revealCorrectAnswerInPreview = true;
  const wrongAnswerPreview = shouldShowWrongAnswerState ? (
    <QuestionFeedbackPreview
      prompt={currentQuestion.prompt}
      imageUrl={currentQuestion.image_url}
      questionType={currentQuestion.question_type}
      options={currentOptions}
      selectedOptionId={selectedOptionId}
      submittedAnswerText={submittedAnswer}
      correctAnswer={resolvedCorrectAnswer}
      revealCorrectAnswer={revealCorrectAnswerInPreview}
    />
  ) : null;

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setAnswerText("");
    setMultiPartAnswers({});
    setShowFeedback(false);
    setSaving(false);
    setAnswers([]);
    setLastSubmittedAnswer(null);
    setPracticeCompleted(false);
    setShowWrongAnswerPreview(false);
    submissionLockRef.current = false;
    submittedQuestionIdsRef.current = new Set();
    continuedQuestionIdsRef.current = new Set();
    postContinueGuardUntilRef.current = 0;
  }, [mode, bundle.day.id, questionIdsSignature]);

  useEffect(() => {
    if (mode === "practice" && isLastQuestion && showFeedback && lastSubmittedAnswer) {
      setPracticeCompleted(true);
    }
  }, [isLastQuestion, lastSubmittedAnswer, mode, showFeedback]);

  useEffect(() => {
    if (!showFeedback || isCorrect) {
      setShowWrongAnswerPreview(false);
    }
  }, [currentQuestion?.id, isCorrect, showFeedback]);

  async function handleSubmit(overrides?: SubmitOverrides) {
    if (
      !currentQuestion ||
      saving ||
      showFeedback ||
      submissionLockRef.current ||
      submittedQuestionIdsRef.current.has(currentQuestion.id)
    ) {
      return;
    }

    const nextSelectedOptionId = overrides?.selectedOptionId ?? selectedOptionId;
    const nextAnswerText = overrides?.answerText ?? answerText;
    const nextSubmittedAnswer =
      currentQuestion.question_type === "open_answer"
        ? multiPartSpec
          ? serializeMultiPartAnswer(multiPartSpec, multiPartAnswers)
          : nextAnswerText
        : currentOptions.find((option) => option.id === nextSelectedOptionId)?.option_text ?? "";
    const nextIsCorrect = evaluateQuestionAnswer(
      { ...currentQuestion, options: currentOptions },
      nextSubmittedAnswer,
      nextSelectedOptionId,
    );

    if (
      currentQuestion.question_type === "open_answer" &&
      (
        multiPartSpec
          ? multiPartFields.some((field) => !(multiPartAnswers[field.key] ?? "").trim())
          : nextAnswerText.trim().length === 0
      )
    ) {
      return;
    }

    if (currentQuestion.question_type !== "open_answer" && !nextSelectedOptionId) {
      return;
    }

    submissionLockRef.current = true;
    submittedQuestionIdsRef.current.add(currentQuestion.id);
    setSaving(true);
    try {
      const answerRecord = {
        questionId: currentQuestion.id,
        topic: currentQuestion.topic,
        isCorrect: nextIsCorrect,
        selectedOptionId: nextSelectedOptionId,
        answerText: nextSubmittedAnswer,
        pointsEarned: nextIsCorrect ? currentQuestion.points : 0,
      } satisfies AnswerRecord;

      if (nextSelectedOptionId !== selectedOptionId) {
        setSelectedOptionId(nextSelectedOptionId);
      }
      setAnswers((previous) => [...previous, answerRecord]);
      setLastSubmittedAnswer(answerRecord);
      continueLockRef.current = false;
      setShowFeedback(true);

      await saveUserAnswer({
        userId: profile.id,
        questionId: currentQuestion.id,
        selectedOptionId: nextSelectedOptionId,
        openAnswer: currentQuestion.question_type === "open_answer" ? nextSubmittedAnswer : null,
        isCorrect: answerRecord.isCorrect,
        pointsEarned: answerRecord.pointsEarned,
      });
    } catch (error) {
      submittedQuestionIdsRef.current.delete(currentQuestion.id);
      throw error;
    } finally {
      submissionLockRef.current = false;
      setSaving(false);
    }
  }

  async function finalizeDayAndGoToResults(fallbackWeakTopics: string[]) {
    setSaving(true);
    try {
      const allAnswers = await listUserAnswersForDay(profile.id, bundle.day.id);
      const latestAnswersByQuestionId = new Map<string, (typeof allAnswers)[number]>();

      for (const answer of allAnswers) {
        if (!latestAnswersByQuestionId.has(answer.question_id)) {
          latestAnswersByQuestionId.set(answer.question_id, answer);
        }
      }

      const publishedQuestionsById = new Map(bundle.questions.map((question) => [question.id, question]));
      const latestPublishedAnswers = Array.from(latestAnswersByQuestionId.values()).filter((answer) =>
        publishedQuestionsById.has(answer.question_id),
      );
      const totalAnsweredQuestions = latestPublishedAnswers.length;
      const correctAnswersCount = latestPublishedAnswers.filter((answer) => answer.is_correct).length;
      const earnedPoints = latestPublishedAnswers.reduce((sum, answer) => sum + (answer.points_earned ?? 0), 0);
      const resolvedWeakTopics = Array.from(
        new Set(
          latestPublishedAnswers
            .filter((answer) => !answer.is_correct)
            .map((answer) => publishedQuestionsById.get(answer.question_id)?.topic?.trim() ?? "")
            .filter((topic) => topic.length > 0),
        ),
      ).slice(0, 4);
      const percentage =
        totalAnsweredQuestions > 0 ? Math.round((correctAnswersCount / totalAnsweredQuestions) * 100) : 0;

      const existingResult = await getUserDayResult(profile.id, bundle.day.id);
      const previousScore = existingResult?.score ?? 0;
      const scoreDelta = Math.max(0, earnedPoints - previousScore);
      const isFirstCompletion = !existingResult;
      const completedDays = Array.from(
        new Set([...(progress?.completed_days ?? []), bundle.day.day_number]),
      ).sort((left, right) => left - right);
      const currentDayNumber = isFirstCompletion
        ? Math.min(course.duration_days, Math.max(progress?.current_day_number ?? 1, bundle.day.day_number + 1))
        : progress?.current_day_number ?? 1;

      await Promise.all([
        saveDayResult({
          user_id: profile.id,
          course_day_id: bundle.day.id,
          score: earnedPoints,
          total_questions: totalAnsweredQuestions,
          percentage,
          weak_topics: resolvedWeakTopics.length > 0 ? resolvedWeakTopics : fallbackWeakTopics,
          completed_at: new Date().toISOString(),
        }),
        upsertUserCourseProgress({
          user_id: profile.id,
          course_id: course.id,
          current_day_number: currentDayNumber,
          completed_days: completedDays,
          total_xp: (progress?.total_xp ?? 0) + scoreDelta + (isFirstCompletion ? 25 : 0),
          streak_days: isFirstCompletion ? (progress?.streak_days ?? 0) + 1 : progress?.streak_days ?? 0,
          last_active_at: new Date().toISOString(),
        }),
      ]);
      navigateToRoute(resultsHref);
    } finally {
      setSaving(false);
    }
  }

  async function handleContinue() {
    if (!currentQuestion) {
      return;
    }

    if (saving) {
      return;
    }

    if (!showFeedback) {
      return;
    }

    if (continueLockRef.current) {
      return;
    }

    if (continuedQuestionIdsRef.current.has(currentQuestion.id)) {
      return;
    }

    continuedQuestionIdsRef.current.add(currentQuestion.id);
    continueLockRef.current = true;

    if (!isLastQuestion) {
      postContinueGuardUntilRef.current = Date.now() + 350;
      console.log("[StudentQuestionFlow] handleContinue:advance", {
        mode,
        currentIndexBefore: currentIndex,
        currentIndexAfter: currentIndex + 1,
        questionId: currentQuestion.id,
        showFeedback,
      });
      setCurrentIndex((index) => index + 1);
      setSelectedOptionId(null);
      setAnswerText("");
      setMultiPartAnswers({});
      setLastSubmittedAnswer(null);
      setShowFeedback(false);
      return;
    }

    const finalAnswerRecords =
      lastSubmittedAnswer && !answers.some((answer) => answer.questionId === lastSubmittedAnswer.questionId)
        ? [...answers, lastSubmittedAnswer]
        : answers;
    const weakTopics = Array.from(
      new Set(finalAnswerRecords.filter((answer) => !answer.isCorrect).map((answer) => answer.topic).filter(Boolean)),
    ).slice(0, 4);

    if (!isFinalSection) {
      console.log("[StudentQuestionFlow] handleContinue:router.push", {
        mode,
        route: nextRoute,
        reason: "section-completed",
      });
      navigateToRoute(nextRoute);
      return;
    }

    await finalizeDayAndGoToResults(weakTopics);
  }

  if (!currentQuestion) {
    return null;
  }

  const buttonDisabled =
    saving ||
    (isMultiPartOpenAnswer
      ? multiPartFields.some((field) => !(multiPartAnswers[field.key] ?? "").trim())
      : answerText.trim().length === 0);
  const questionTopicLabel = currentQuestion.topic?.trim() ? formatTopicLabel(currentQuestion.topic) : null;
  const questionWithSourceMeta = currentQuestion as Question & {
    exam_type?: string | null;
    source?: string | null;
  };
  const showRealNvoSourceLabel =
    mode === "bonus" &&
    (
      currentQuestion.source_year !== null ||
      questionWithSourceMeta.exam_type?.trim() === "НВО" ||
      (questionWithSourceMeta.source?.toLocaleUpperCase("bg-BG").includes("НВО") ?? false)
    );
  const questionSourceLabel =
    mode === "bonus" ? null : currentQuestion.source_year ? `НВО ${currentQuestion.source_year}` : null;
  const difficultyLabel = getDifficultyLabel(currentQuestion.difficulty);
  const topicHref =
    currentQuestion.topic?.trim()
      ? buildLessonTopicHref(course.slug, bundle.day.day_number, currentQuestion.topic)
      : null;
  const feedbackPanelMessage = shouldShowWrongAnswerState
    ? "Не е този отговор. Виж условието още веднъж и сравни с обяснението."
    : feedbackPanelText;

  function navigateToRoute(nextHref: string) {
    router.push(nextHref);

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        if (window.location.pathname !== nextHref) {
          window.location.assign(nextHref);
        }
      }, 180);
    }
  }

  function handleEnterSubmit() {
    if (showFeedback || buttonDisabled) {
      return;
    }

    void handleSubmit();
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }}
      className="mx-auto max-w-6xl space-y-5"
      onKeyDown={(event) => {
        if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
          return;
        }

        if (showFeedback || currentQuestion.question_type !== "open_answer") {
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
      <DayTopBarProgress
        courseSlug={course.slug}
        dayNumber={bundle.day.day_number}
        label={mode === "quiz" ? "Тест" : mode === "bonus" ? "Изпитай се" : "Упражни"}
        helper={
          mode === "practice"
            ? "Реши задачите за деня докрай, за да се отчетат в прогреса."
            : "Тестът и Изпитай се са отделни от дневния прогрес по теория, видео и задачи."
        }
        currentStep={mode === "practice" ? "practice" : undefined}
        currentStepCompleted={mode === "practice" ? practiceCompleted : false}
      />

      <NeonCard padding="sm">
        <SectionHeader
          label={flowCopy.header}
          title={<h2 className="mh-heading-lg">{mode === "bonus" ? "Реални задачи от НВО" : bundle.day.title}</h2>}
          action={<Badge tone="cyan">{currentIndex + 1} / {totalQuestions} въпроса</Badge>}
        />
      </NeonCard>

      <MascotCharacter
        mood="idle"
        message={flowCopy.mascotMessage}
        xpText={mode === "quiz" ? "+25 XP при завършен тест" : undefined}
        showVisual={false}
      />

      <AnimatePresence initial={false} mode="wait">
        <motion.section
          key={currentQuestion.id}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" }}
          className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]"
        >
        <NeonCard as="article" padding="md" className="lg:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mh-label">ДЕН {bundle.day.day_number}</p>
              <p className="mh-label">ВЪПРОС {currentIndex + 1}/{totalQuestions}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {questionSourceLabel ? <Badge tone="gold">{questionSourceLabel}</Badge> : null}
                {questionTopicLabel ? <Badge tone="cyan">{questionTopicLabel}</Badge> : null}
                <Badge tone="purple">{difficultyLabel}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/8 bg-white/[0.03] p-5 lg:p-6">
            <p className="mh-label">Условие</p>
            <div className="mt-4 max-w-3xl text-white">
              <MathText
                text={currentQuestion.prompt}
                className="text-base leading-7"
              />
            </div>

            {currentQuestion.image_url ? (
              <div className="mt-5 flex justify-center">
                <div className="w-full max-w-3xl overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
                  <img
                    src={currentQuestion.image_url}
                    alt={`Илюстрация към задача ${currentIndex + 1}`}
                    className="block h-auto max-w-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            ) : null}
          </div>

          {currentQuestion.question_type === "open_answer" ? (
            <div className="mt-6">
              <p className="mh-label mb-3">Твоят отговор</p>
              {multiPartSpec ? (
                <div className="space-y-4">
                  <p className="mh-copy-sm text-slate-400">
                    Попълни всички полета по реда от задачата.
                  </p>
                  {multiPartSpec.fields.map((field, index) => (
                    <div key={field.key} className="space-y-2">
                      <label className="block text-sm font-semibold text-[var(--mh-text-soft)]">
                        {index + 1}. {field.label}
                      </label>
                      <div className="flex items-center gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">
                        <input
                          value={multiPartAnswers[field.key] ?? ""}
                          onChange={(event) => {
                            const nextValue = event.currentTarget.value;
                            setMultiPartAnswers((current) => ({
                              ...current,
                              [field.key]: nextValue,
                            }));
                          }}
                          placeholder={field.placeholder ?? "Въведи отговор"}
                          disabled={showFeedback || saving}
                          className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                          onKeyDown={(event) => {
                            if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
                              return;
                            }

                            event.preventDefault();
                            handleEnterSubmit();
                          }}
                        />
                        {field.unit ? (
                          <span className="shrink-0 text-sm font-semibold text-cyan-200">{field.unit}</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <p className="mh-label">Избери отговор</p>
              {currentOptions.map((option, optionIndex) => (
                <AnswerOption
                  key={option.id}
                  optionId={String.fromCharCode(65 + optionIndex)}
                  optionText={<MathText text={option.option_text} as="span" inline />}
                  isSelected={selectedOptionId === option.id}
                  isCorrect={Boolean(option.is_correct)}
                  showFeedback={false}
                  onClick={() => {
                    if (!showFeedback && !saving && Date.now() >= postContinueGuardUntilRef.current) {
                      setSelectedOptionId(option.id);
                      void handleSubmit({ selectedOptionId: option.id });
                    }
                  }}
                />
              ))}
            </div>
          )}

          {!showFeedback && currentQuestion.question_type === "open_answer" ? (
            <div className="mt-6">
              <NeonButton type="button" onClick={() => void handleSubmit()} disabled={buttonDisabled}>
                {saving ? "Запазване..." : "Провери отговора"}
              </NeonButton>
            </div>
          ) : null}

          {showRealNvoSourceLabel ? (
            <p className="mt-6 text-sm leading-6 text-slate-500">
              Източник: реална НВО задача
            </p>
          ) : null}
        </NeonCard>

        <NeonCard padding="sm" className="bg-[rgb(1,1,2)] lg:p-6">
          <p className="mh-label">Обратна връзка</p>
          <div className="mt-5">
            {feedbackPanelVisual ? (
              <div className="mb-4 flex justify-center">
                <Image
                  src={feedbackPanelVisual.src}
                  alt={feedbackPanelVisual.alt}
                  width={104}
                  height={104}
                  className="h-[88px] w-[88px] object-contain sm:h-[104px] sm:w-[104px]"
                  unoptimized
                />
              </div>
            ) : null}
            <p className="mh-copy whitespace-pre-line text-slate-300">{feedbackPanelMessage}</p>
          </div>

          {shouldShowWrongAnswerState ? (
            <div className="mt-4 space-y-3">
              <NeonButton
                type="button"
                variant="ghost"
                className="w-full justify-center"
                onClick={() => setShowWrongAnswerPreview((current) => !current)}
              >
                {showWrongAnswerPreview ? "Скрий задачата" : "👀 Виж къде си сбъркал"}
              </NeonButton>

              <AnimatePresence initial={false}>
                {showWrongAnswerPreview && wrongAnswerPreview ? (
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
                    className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4"
                  >
                    {wrongAnswerPreview}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : null}

          {topicHref ? (
            <div className="mt-4">
              <NeonButton href={topicHref} variant="ghost" className="w-full justify-center">
                Към темата
              </NeonButton>
            </div>
          ) : null}
        </NeonCard>
        </motion.section>
      </AnimatePresence>

      <AnswerFeedbackModal
        isOpen={showFeedback}
        state={feedbackState}
        isCorrect={isCorrect}
        explanation={askMatExplanation}
        correctAnswer={resolvedCorrectAnswer}
        showStandaloneCorrectAnswer={mode !== "bonus"}
        pointsEarned={isCorrect ? currentQuestion.points : 0}
        primaryLabel={resolvedPrimaryLabel}
        showAskMat={showAskMatInFeedback}
        titleOverride={undefined}
        messageOverride={undefined}
        completionHint={null}
        mascotGifSrcOverride={null}
        wrongAnswerPreview={wrongAnswerPreview}
        onContinue={() => void handleContinue()}
      />
    </motion.div>
  );
}
