import { getMiniTestQuestions, getPracticeQuestions } from "@/lib/questionGroups";
import { clampPercentage, getCourseProgressPercent } from "@/lib/progress";
import type { DayPlanStep, DayTimelineItem, GoalProgressModel, HeroBuddyModel } from "@/types";
import type { DayContentBundle, Lesson, Question } from "@/types/course";
import type { UserProfile, UserProgress } from "@/types/user";

interface EvaluableOption {
  option_text: string;
  is_correct: boolean;
}

interface EvaluableQuestion {
  expected_answer: string | null;
  options?: EvaluableOption[];
}

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
): DayTimelineItem[] {
  return days.map((day) => ({
    id: day.id,
    dayNumber: day.day_number,
    title: `Ден ${day.day_number}`,
    subtitle: day.title,
    isActive: day.day_number === activeDayNumber,
    href: buildDayHref(courseSlug, day.day_number),
  }));
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
  const bonusQuestions: Question[] = [];
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
    ctaLabel: "Задачи",
    tone: "cyan",
    count: practiceQuestions.length,
    href: buildPracticeHref(courseSlug, bundle.day.day_number),
  });

  if (hasQuiz) {
    steps.push({
      id: `${bundle.day.id}-results`,
      type: "results",
      eyebrow: "4. РЕЗУЛТАТ",
      title: "Виж резултата",
      ctaLabel: "Резултат",
      tone: "gold",
      count: null,
      href: buildResultsHref(courseSlug, bundle.day.day_number),
    });
  }

  if (bonusQuestions.length > 0) {
    steps.push({
      id: `${bundle.day.id}-bonus`,
      type: "bonus",
      eyebrow: "БОНУС",
      title: `${bonusQuestions.length} допълнителни`,
      ctaLabel: "За още прогрес",
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
  const theorySection = primaryLesson?.sections?.find((section) => section.section_type === "theory" && section.content?.trim());
  const summary = bundle.day.description?.trim();

  return {
    keyPoints: summary || theorySection?.title || bundle.day.title,
    example: primaryLesson ? getExampleText(primaryLesson, bundle.questions) : bundle.day.description,
  };
}

export function getLearningOutcomes(bundle: DayContentBundle) {
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
    progress: normalizedTargetScore > 0 ? clampPercentage((currentScore / normalizedTargetScore) * 100) : 0,
  };
}

export function normalizeAnswer(answer: string) {
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getResolvedCorrectAnswer(question: EvaluableQuestion) {
  const optionAnswer = question.options?.find((option) => option.is_correct)?.option_text ?? null;
  return question.expected_answer ?? optionAnswer;
}

export function evaluateQuestionAnswer(question: EvaluableQuestion, submittedAnswer: string) {
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
