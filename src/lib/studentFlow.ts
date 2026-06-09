import { getBonusQuestionsForAttempt, getMiniTestQuestions, getPracticeQuestions } from "@/lib/questionGroups";
import { clampPercentage, getCourseProgressPercent } from "@/lib/progress";
import type { DayPlanStep, DayTimelineItem, GoalProgressModel, HeroBuddyModel } from "@/types";
import type { DayContentBundle, Lesson, Question } from "@/types/course";
import type { UserProfile, UserProgress } from "@/types/user";

interface EvaluableOption {
  id?: string;
  option_text: string;
  is_correct: boolean;
}

interface EvaluableQuestion {
  id?: string;
  question_type?: string | null;
  expected_answer: string | null;
  options?: EvaluableOption[];
}

export interface MultiPartAnswerField {
  key: string;
  label: string;
  unit?: string;
  placeholder?: string;
}

export interface MultiPartAnswerSpec {
  kind: "multi_part_numeric";
  display: string;
  fields: MultiPartAnswerField[];
}

const MULTI_PART_OPEN_ANSWER_SPECS: Record<string, MultiPartAnswerSpec> = {
  "522936ea-837a-4a9c-0c91-63c0e540a1d2": {
    kind: "multi_part_numeric",
    display: "Атлас: 20%; общо продадени: 180; Атлас пакети: 36; Блян пакети: 54; Мечта пакети: 90; обща сума: 216000 лв.",
    fields: [
      { key: "atlas_percent", label: "Атлас е продала", unit: "%" },
      { key: "sold_total", label: "Общо продадени пакети" },
      { key: "atlas_packages", label: "Атлас пакети" },
      { key: "blyan_packages", label: "Блян пакети" },
      { key: "mechta_packages", label: "Мечта пакети" },
      { key: "total_amount", label: "Обща сума", unit: "лв." },
    ],
  },
};

export function buildCourseHref(courseSlug: string) {
  void courseSlug;
  return "/dashboard";
}

export function buildDayHref(courseSlug: string, dayNumber: number) {
  void courseSlug;
  return `/day/${dayNumber}`;
}

export function buildLessonHref(courseSlug: string, dayNumber: number) {
  return `${buildDayHref(courseSlug, dayNumber)}/lesson`;
}

export function buildVideoHref(courseSlug: string, dayNumber: number) {
  return `${buildDayHref(courseSlug, dayNumber)}/video`;
}

export function buildPracticeHref(courseSlug: string, dayNumber: number) {
  return `${buildDayHref(courseSlug, dayNumber)}/practice`;
}

export function buildQuizHref(courseSlug: string, dayNumber: number) {
  return `${buildDayHref(courseSlug, dayNumber)}/quiz`;
}

export function buildBonusHref(courseSlug: string, dayNumber: number) {
  return `${buildDayHref(courseSlug, dayNumber)}/bonus`;
}

export function buildResultsHref(courseSlug: string, dayNumber: number) {
  return `${buildDayHref(courseSlug, dayNumber)}/results`;
}

export function parseDayNumberParam(value: string | null | undefined) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

export function getCurrentDayNumber(progress: UserProgress | null, totalDays: number) {
  return Math.min(totalDays, Math.max(1, progress?.current_day_number ?? 1));
}

export function getDashboardProgress(progress: UserProgress | null, totalDays: number) {
  return getCourseProgressPercent(progress, totalDays);
}

export function mapTimeline(
  days: Array<{ id: string; day_number: number; title: string; subtitle: string }>,
  courseSlug: string,
  activeDayNumber: number,
  maxUnlockedDay?: number,
  completedDayNumbers: number[] = [],
): DayTimelineItem[] {
  return days.map((day) => {
    const isCompleted = completedDayNumbers.includes(day.day_number);
    const isUnlocked =
      maxUnlockedDay === undefined
        ? true
        : day.day_number <= maxUnlockedDay || day.day_number === activeDayNumber || isCompleted;

    return {
      id: day.id,
      dayNumber: day.day_number,
      title: `Ден ${day.day_number}`,
      subtitle: day.title,
      isActive: day.day_number === activeDayNumber,
      isUnlocked,
      isCompleted,
      href: isUnlocked ? buildDayHref(courseSlug, day.day_number) : undefined,
    };
  });
}

function getExampleText(lesson: Lesson, questions: Question[]) {
  const exampleSection = lesson.sections?.find((section) => section.section_type === "example");
  if (exampleSection?.content) {
    return exampleSection.content;
  }

  return questions
    .slice(0, 3)
    .map((question) => question.prompt)
    .join("\n");
}

export function getPlanSteps(bundle: DayContentBundle, courseSlug: string): DayPlanStep[] {
  const practiceQuestions = getPracticeQuestions(bundle.questions);
  const quizQuestions = getMiniTestQuestions(bundle.questions);
  const bonusQuestions = getBonusQuestionsForAttempt(bundle.questions);
  const hasQuiz = quizQuestions.length > 0;

  const steps: DayPlanStep[] = [
    {
      id: `${bundle.day.id}-lesson`,
      type: "lesson",
      eyebrow: "1. ПРОЧЕТИ",
      title: bundle.lessons[0]?.title ?? "Урокът",
      ctaLabel: "Теория и видео",
      tone: "purple",
      count: null,
      href: buildLessonHref(courseSlug, bundle.day.day_number),
    },
  ];

  if (hasQuiz) {
    steps.push({
      id: `${bundle.day.id}-quiz`,
      type: "quiz",
      eyebrow: "2. ПРОВЕРИ",
      title: `${quizQuestions.length} въпроса`,
      ctaLabel: "Тест за деня",
      tone: "green",
      count: quizQuestions.length,
      href: buildQuizHref(courseSlug, bundle.day.day_number),
    });
  }

  steps.push({
    id: `${bundle.day.id}-practice`,
    type: "practice",
    eyebrow: hasQuiz ? "3. УПРАЖНИ" : "2. УПРАЖНИ",
    title: `${practiceQuestions.length} основни задачи`,
    ctaLabel: "Упражни",
    tone: "cyan",
    count: practiceQuestions.length,
    href: buildPracticeHref(courseSlug, bundle.day.day_number),
  });

  if (bonusQuestions.length > 0) {
    steps.push({
      id: `${bundle.day.id}-bonus`,
      type: "bonus",
      eyebrow: hasQuiz ? "4. ИЗПИТАЙ СЕ" : "3. ИЗПИТАЙ СЕ",
      title: "Реални задачи от НВО",
      ctaLabel: "Изпитай се",
      tone: "gold",
      count: bonusQuestions.length,
      href: buildBonusHref(courseSlug, bundle.day.day_number),
    });
  }

  return steps;
}

export function hasPublishedLessonVideo(lesson: Pick<Lesson, "video_status" | "video_url"> | null | undefined) {
  if (!lesson?.video_url) {
    return false;
  }

  return lesson.video_status !== "draft";
}

export function getPublishedLessonVideoUrl(lesson: Pick<Lesson, "video_status" | "video_url"> | null | undefined) {
  return hasPublishedLessonVideo(lesson) ? lesson?.video_url ?? null : null;
}

export function getLessonBlocks(bundle: DayContentBundle) {
  const primaryLesson = bundle.lessons[0];
  const theorySection = primaryLesson?.sections?.find(
    (section) => section.section_type === "theory" && section.content?.trim(),
  );
  const summary = bundle.day.description?.trim();

  return {
    keyPoints: summary || theorySection?.title || bundle.day.title,
    example: primaryLesson ? getExampleText(primaryLesson, bundle.questions) : bundle.day.description,
  };
}

export function getLearningOutcomes(bundle: DayContentBundle) {
  if (bundle.day.day_number === 2) {
    return [
      "Буквени изрази",
      "Скоби и подобни членове",
      "Формули за съкратено умножение",
      "Уравнения и неравенства",
    ];
  }

  if (bundle.day.day_number === 3) {
    return [
      "Процент от число",
      "Намиране на цяло по даден процент",
      "Процентно увеличение и намаление",
      "Последователни процентни промени",
      "Отношения и пропорции",
      "Мащаб и зависимости",
      "Диаграми и таблици",
    ];
  }

  const uniqueTopics = Array.from(
    bundle.questions
      .map((question) => question.topic?.trim())
      .filter(Boolean)
      .reduce((map, topic) => {
        const key = topic!.toLocaleLowerCase("bg-BG");
        if (!map.has(key)) {
          map.set(key, topic!);
        }
        return map;
      }, new Map<string, string>())
      .values(),
  );

  if (uniqueTopics.length > 0) {
    return uniqueTopics.slice(0, 4);
  }

  return bundle.lessons[0]?.sections?.slice(0, 4).map((section) => section.title) ?? [bundle.day.title];
}

export function getHeroBuddy(bundle: DayContentBundle): HeroBuddyModel {
  const quizPoints = getMiniTestQuestions(bundle.questions).reduce(
    (sum, question) => sum + question.points,
    0,
  );

  return {
    title: "Супер ход!",
    message:
      bundle.day.description ||
      "Мини първо през урока, после провери знанията си с теста и накрая реши задачите.",
    rewardLabel: `+${quizPoints} XP след тест`,
  };
}

export function getGoalModel(profile: UserProfile | null, currentScore = 0): GoalProgressModel {
  const targetScore = profile?.goal_score ?? 80;
  const normalizedTargetScore = Math.max(0, Math.min(100, targetScore));
  return {
    title: "МОЯТА ЦЕЛ",
    target: normalizedTargetScore >= 100 ? "100% на НВО" : `${normalizedTargetScore}%+ на НВО`,
    progress:
      normalizedTargetScore > 0
        ? clampPercentage((currentScore / normalizedTargetScore) * 100)
        : 0,
  };
}

export function normalizeAnswer(answer: string) {
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeNumericPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/−/g, "-")
    .replace(/,/g, ".")
    .replace(/\s+/g, "")
    .replace(/лв\.?|lv\.?|процента|процент|%|km|cm/gi, "");
}

function splitMultiPartAnswerParts(value: string) {
  return value
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function getMultiPartAnswerSpec(question: EvaluableQuestion) {
  if (question.question_type !== "open_answer" || !question.id) {
    return null;
  }

  return MULTI_PART_OPEN_ANSWER_SPECS[question.id] ?? null;
}

export function serializeMultiPartAnswer(
  spec: MultiPartAnswerSpec,
  answers: Record<string, string>,
) {
  return spec.fields.map((field) => (answers[field.key] ?? "").trim()).join("; ");
}

function evaluateMultiPartAnswer(
  question: EvaluableQuestion,
  spec: MultiPartAnswerSpec,
  submittedAnswer: string,
) {
  const submittedParts = splitMultiPartAnswerParts(submittedAnswer);
  const expectedParts = splitMultiPartAnswerParts(question.expected_answer ?? "");

  if (submittedParts.length !== spec.fields.length || expectedParts.length !== spec.fields.length) {
    return false;
  }

  return spec.fields.every((_, index) => {
    return normalizeNumericPart(submittedParts[index] ?? "") === normalizeNumericPart(expectedParts[index] ?? "");
  });
}

export function getResolvedCorrectAnswer(question: EvaluableQuestion) {
  const multiPartSpec = getMultiPartAnswerSpec(question);
  if (multiPartSpec) {
    return multiPartSpec.display;
  }

  const optionAnswer = question.options?.find((option) => option.is_correct)?.option_text ?? null;
  if (question.question_type === "multiple_choice") {
    return optionAnswer ?? question.expected_answer;
  }

  return question.expected_answer ?? optionAnswer;
}

function warnQuestionCheck(message: string, details: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(message, details);
  }
}

function getSubmittedOption(
  question: EvaluableQuestion,
  submittedAnswer: string,
  submittedOptionId?: string | null,
) {
  if (!question.options || question.options.length === 0) {
    return null;
  }

  if (submittedOptionId) {
    const matchedById = question.options.find((option) => option.id === submittedOptionId);
    if (matchedById) {
      return matchedById;
    }
  }

  const normalizedSubmittedAnswer = normalizeAnswer(submittedAnswer);
  if (!normalizedSubmittedAnswer) {
    return null;
  }

  return (
    question.options.find((option) => normalizeAnswer(option.option_text) === normalizedSubmittedAnswer) ?? null
  );
}

export function evaluateQuestionAnswer(
  question: EvaluableQuestion,
  submittedAnswer: string,
  submittedOptionId?: string | null,
) {
  if (question.question_type === "multiple_choice") {
    if (!question.options || question.options.length === 0) {
      warnQuestionCheck("[studentFlow] Multiple-choice question has no options.", {
        questionType: question.question_type,
      });
      return false;
    }

    const correctOptions = question.options.filter((option) => option.is_correct);
    if (correctOptions.length === 0) {
      warnQuestionCheck("[studentFlow] Multiple-choice question has no correct option.", {
        questionType: question.question_type,
      });
      return false;
    }

    const submittedOption = getSubmittedOption(question, submittedAnswer, submittedOptionId);
    if (!submittedOption) {
      warnQuestionCheck("[studentFlow] Could not resolve submitted option for multiple-choice question.", {
        questionType: question.question_type,
        submittedOptionId: submittedOptionId ?? null,
        submittedAnswer,
      });
      return false;
    }

    return submittedOption.is_correct;
  }

  const multiPartSpec = getMultiPartAnswerSpec(question);
  if (multiPartSpec) {
    return evaluateMultiPartAnswer(question, multiPartSpec, submittedAnswer);
  }

  const resolvedCorrectAnswer = getResolvedCorrectAnswer(question);
  if (!resolvedCorrectAnswer) {
    return false;
  }

  return normalizeAnswer(resolvedCorrectAnswer) === normalizeAnswer(submittedAnswer);
}

export function getEmbeddedVideoUrl(videoUrl: string | null) {
  if (!videoUrl) {
    return null;
  }

  try {
    const url = new URL(videoUrl);

    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl;
    }

    if (url.hostname.includes("youtu.be")) {
      const videoId = url.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl;
    }

    if (url.hostname.includes("vimeo.com")) {
      const videoId = url.pathname.split("/").filter(Boolean).pop();
      return videoId ? `https://player.vimeo.com/video/${videoId}` : videoUrl;
    }

    return videoUrl;
  } catch {
    return videoUrl;
  }
}
