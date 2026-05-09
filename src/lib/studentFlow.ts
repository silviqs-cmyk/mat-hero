import { resolveQuestionGroup } from "@/lib/questionGroups";
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
  const currentDay = getCurrentDayNumber(progress, totalDays);
  return Math.max(10, Math.round((currentDay / totalDays) * 100));
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
  const practiceQuestions = bundle.questions.filter((question) => resolveQuestionGroup(question) === "practice");
  const quizQuestions = bundle.questions.filter((question) => resolveQuestionGroup(question) === "quiz");
  const bonusQuestions = bundle.questions.filter((question) => resolveQuestionGroup(question) === "bonus");

  return [
    {
      id: `${bundle.day.id}-lesson`,
      type: "lesson",
      eyebrow: "1. ПРОЧЕТИ",
      title: bundle.lessons[0]?.title ?? "Урокът",
      ctaLabel: "Теория и пример",
      tone: "purple",
      count: null,
      href: buildLessonHref(courseSlug, bundle.day.day_number),
    },
    {
      id: `${bundle.day.id}-practice`,
      type: "practice",
      eyebrow: "2. УПРАЖНИ",
      title: `${practiceQuestions.length} основни задачи`,
      ctaLabel: "Задачи",
      tone: "cyan",
      count: practiceQuestions.length,
      href: buildPracticeHref(courseSlug, bundle.day.day_number),
    },
    {
      id: `${bundle.day.id}-quiz`,
      type: "quiz",
      eyebrow: "3. ПРОВЕРИ",
      title: `${quizQuestions.length} въпроса`,
      ctaLabel: "Тест за деня",
      tone: "green",
      count: quizQuestions.length,
      href: buildQuizHref(courseSlug, bundle.day.day_number),
    },
    {
      id: `${bundle.day.id}-bonus`,
      type: "bonus",
      eyebrow: "БОНУС",
      title: `${bonusQuestions.length} допълнителни`,
      ctaLabel: "За още прогрес",
      tone: "gold",
      count: bonusQuestions.length,
      href: buildBonusHref(courseSlug, bundle.day.day_number),
    },
  ];
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
  const theorySection = primaryLesson?.sections?.find((section) =>
    ["theory", "tip", "warning", "formula"].includes(section.section_type),
  );

  return {
    keyPoints: theorySection?.content ?? primaryLesson?.content ?? bundle.day.description,
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
  const quizPoints = bundle.questions
    .filter((question) => resolveQuestionGroup(question) === "quiz")
    .reduce((sum, question) => sum + question.points, 0);

  return {
    title: "Супер ход!",
    message:
      bundle.day.description ||
      "Мини първо през кратката теория, после отвори основните задачи една по една и чак накрая тръгни към теста.",
    rewardLabel: `+${quizPoints} XP след тест`,
  };
}

export function getGoalModel(profile: UserProfile | null): GoalProgressModel {
  const targetScore = profile?.goal_score ?? 80;
  return {
    title: "МОЯТА ЦЕЛ",
    target: `${targetScore}+ точки на НВО`,
    progress: Math.max(20, Math.min(95, Math.round((targetScore / 100) * 44))),
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
