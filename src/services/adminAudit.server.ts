import "server-only";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { resolveQuestionGroup } from "@/lib/questionGroups";
import { DEFAULT_COURSE_SLUG } from "@/services/courses";
import type { CourseDay, Lesson, LessonSection, Question, QuestionOption } from "@/types/course";

const ADMIN_TOTAL_DAYS = 10;

type WarningSeverity = "info" | "warning" | "critical";

interface AuditWarning {
  code:
    | "missing_theory"
    | "quiz_under_target"
    | "practice_under_target"
    | "bonus_under_target"
    | "missing_explanations"
    | "duplicate_prompts"
    | "missing_correct_answer"
    | "missing_options"
    | "duplicate_sort_order"
    | "unpublished_questions"
    | "empty_topic";
  severity: WarningSeverity;
  message: string;
}

interface DuplicatePromptGroup {
  key: string;
  questionIds: string[];
  prompts: string[];
}

interface DuplicateSortOrderGroup {
  scope: "quiz" | "practice" | "bonus";
  sortOrder: number;
  questionIds: string[];
}

interface AdminQuestionAuditItem {
  id: string;
  questionText: string;
  prompt: string;
  correctAnswer: string | null;
  questionGroup: "quiz" | "practice" | "bonus";
  topic: string;
  subtopic: null;
  difficulty: Question["difficulty"];
  points: number;
  sortOrder: number;
  isPublished: boolean;
  hasOptions: boolean;
  hasExplanation: boolean;
  sourceYear: number | null;
  expectedAnswer: string | null;
  optionCount: number;
}

interface AdminQuestionGroupAudit {
  count: number;
  publishedCount: number;
  items: AdminQuestionAuditItem[];
}

interface AdminDayCardAudit {
  dayNumber: number;
  title: string;
  status: "missing" | "draft" | "published";
  hasTheory: boolean;
  videoStatus: "published" | "draft" | "missing";
  hasVideo: boolean;
  readSectionCount: number;
  quizCount: number;
  practiceCount: number;
  bonusCount: number;
  totalQuestions: number;
  questionsWithExplanation: number;
  questionsWithoutExplanation: number;
  duplicateQuestionCount: number;
  warnings: AuditWarning[];
}

interface AdminDashboardSummary {
  publishedDays: number;
  totalDays: number;
  totalLessonSections: number;
  publishedQuestions: number;
  publishedVideos: number;
  missingAskMatExplanations: number;
  potentialDuplicateQuestions: number;
}

export interface AdminDashboardAudit {
  course: {
    id: string;
    slug: string;
    title: string;
  };
  summary: AdminDashboardSummary;
  days: AdminDayCardAudit[];
}

export interface AdminDayAudit {
  course: {
    id: string;
    slug: string;
    title: string;
  };
  dayNumber: number;
  exists: boolean;
  overview: {
    title: string;
    status: "missing" | "draft" | "published";
    readiness: "missing" | "warning" | "ready";
    theorySectionCount: number;
    videoStatus: "published" | "draft" | "missing";
    quizCount: number;
    practiceCount: number;
    bonusCount: number;
    totalQuestions: number;
    questionsWithExplanation: number;
    questionsWithoutExplanation: number;
    duplicateQuestionCount: number;
    warnings: AuditWarning[];
  };
  read: {
    day: CourseDay | null;
    lesson: Lesson | null;
    sections: LessonSection[];
  };
  quiz: AdminQuestionGroupAudit;
  practice: AdminQuestionGroupAudit;
  bonus: AdminQuestionGroupAudit;
  askMat: {
    totalQuestions: number;
    withExplanation: number;
    withoutExplanation: number;
    items: Array<{
      id: string;
      group: "quiz" | "practice" | "bonus";
      questionText: string;
      hasExplanation: boolean;
    }>;
  };
  checks: {
    warnings: AuditWarning[];
    duplicatePromptGroups: DuplicatePromptGroup[];
    duplicateSortOrders: DuplicateSortOrderGroup[];
    missingExplanationIds: string[];
    missingCorrectAnswerIds: string[];
    missingOptionsIds: string[];
    emptyTopicIds: string[];
    unpublishedQuestionIds: string[];
  };
}

interface CourseAuditContext {
  course: {
    id: string;
    slug: string;
    title: string;
  };
  days: CourseDay[];
  lessons: Lesson[];
  sections: LessonSection[];
  questions: Question[];
  questionOptions: QuestionOption[];
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function normalizePrompt(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s+([?!.,;:])/g, "$1")
    .toLocaleLowerCase("bg-BG");
}

function buildLoosePromptKey(value: string) {
  return normalizePrompt(value).replace(/[\s?!.,;:'"“”„()]/g, "");
}

function getResolvedCorrectAnswer(question: Question, options: QuestionOption[]) {
  if (hasText(question.expected_answer)) {
    return question.expected_answer!.trim();
  }

  const correctOption = options.find((option) => option.is_correct);
  return correctOption?.option_text?.trim() || null;
}

function getQuestionAuditItem(question: Question, options: QuestionOption[]): AdminQuestionAuditItem {
  const resolvedGroup = resolveQuestionGroup(question);
  const correctAnswer = getResolvedCorrectAnswer(question, options);

  return {
    id: question.id,
    questionText: question.prompt,
    prompt: question.prompt,
    correctAnswer,
    questionGroup: resolvedGroup,
    topic: question.topic?.trim() || "",
    subtopic: null,
    difficulty: question.difficulty,
    points: question.points,
    sortOrder: question.sort_order,
    isPublished: question.is_published,
    hasOptions: options.length > 0,
    hasExplanation: hasText(question.explanation),
    sourceYear: question.source_year,
    expectedAnswer: question.expected_answer,
    optionCount: options.length,
  };
}

function getQuestionOptionsMap(questionOptions: QuestionOption[]) {
  const optionsByQuestionId = new Map<string, QuestionOption[]>();

  for (const option of questionOptions) {
    const current = optionsByQuestionId.get(option.question_id) ?? [];
    current.push(option);
    optionsByQuestionId.set(
      option.question_id,
      current.sort((left, right) => left.sort_order - right.sort_order),
    );
  }

  return optionsByQuestionId;
}

function getDayLesson(lessons: Lesson[], dayId: string) {
  return (
    lessons
      .filter((lesson) => lesson.course_day_id === dayId)
      .sort((left, right) => left.sort_order - right.sort_order)[0] ?? null
  );
}

function getDaySections(sections: LessonSection[], lessonId: string | null) {
  if (!lessonId) {
    return [];
  }

  return sections
    .filter((section) => section.lesson_id === lessonId)
    .sort((left, right) => left.sort_order - right.sort_order);
}

function getQuestionGroupCounts(questions: Question[]) {
  return {
    quiz: questions.filter((question) => resolveQuestionGroup(question) === "quiz").length,
    practice: questions.filter((question) => resolveQuestionGroup(question) === "practice").length,
    bonus: questions.filter((question) => resolveQuestionGroup(question) === "bonus").length,
  };
}

function getDuplicatePromptGroups(questions: Question[]) {
  const groups = new Map<string, Question[]>();

  for (const question of questions) {
    const key = buildLoosePromptKey(question.prompt);
    if (!key) {
      continue;
    }

    const current = groups.get(key) ?? [];
    current.push(question);
    groups.set(key, current);
  }

  return Array.from(groups.entries())
    .filter(([, groupedQuestions]) => groupedQuestions.length > 1)
    .map(([key, groupedQuestions]) => ({
      key,
      questionIds: groupedQuestions.map((question) => question.id),
      prompts: groupedQuestions.map((question) => question.prompt),
    }));
}

function getDuplicateSortOrders(questions: Question[]) {
  const byGroup = new Map<string, Map<number, Question[]>>();

  for (const question of questions) {
    const group = resolveQuestionGroup(question);
    const bySortOrder = byGroup.get(group) ?? new Map<number, Question[]>();
    const current = bySortOrder.get(question.sort_order) ?? [];
    current.push(question);
    bySortOrder.set(question.sort_order, current);
    byGroup.set(group, bySortOrder);
  }

  return Array.from(byGroup.entries()).flatMap(([group, bySortOrder]) =>
    Array.from(bySortOrder.entries())
      .filter(([, groupedQuestions]) => groupedQuestions.length > 1)
      .map(([sortOrder, groupedQuestions]) => ({
        scope: group as "quiz" | "practice" | "bonus",
        sortOrder,
        questionIds: groupedQuestions.map((question) => question.id),
      })),
  );
}

function getMissingCorrectAnswerIds(questions: Question[], optionsByQuestionId: Map<string, QuestionOption[]>) {
  return questions
    .filter((question) => !getResolvedCorrectAnswer(question, optionsByQuestionId.get(question.id) ?? []))
    .map((question) => question.id);
}

function getMissingOptionsIds(questions: Question[], optionsByQuestionId: Map<string, QuestionOption[]>) {
  return questions
    .filter((question) => {
      if (question.question_type === "open_answer") {
        return false;
      }

      return (optionsByQuestionId.get(question.id) ?? []).length === 0;
    })
    .map((question) => question.id);
}

function getEmptyTopicIds(questions: Question[]) {
  return questions.filter((question) => !hasText(question.topic)).map((question) => question.id);
}

function getMissingExplanationIds(questions: Question[]) {
  return questions.filter((question) => !hasText(question.explanation)).map((question) => question.id);
}

function buildWarnings(input: {
  lesson: Lesson | null;
  sections: LessonSection[];
  questions: Question[];
  optionsByQuestionId: Map<string, QuestionOption[]>;
}) {
  const warnings: AuditWarning[] = [];
  const counts = getQuestionGroupCounts(input.questions);
  const missingExplanationIds = getMissingExplanationIds(input.questions);
  const duplicatePromptGroups = getDuplicatePromptGroups(input.questions);
  const duplicateSortOrders = getDuplicateSortOrders(input.questions);
  const missingCorrectAnswerIds = getMissingCorrectAnswerIds(input.questions, input.optionsByQuestionId);
  const missingOptionsIds = getMissingOptionsIds(input.questions, input.optionsByQuestionId);
  const emptyTopicIds = getEmptyTopicIds(input.questions);
  const unpublishedQuestionIds = input.questions.filter((question) => !question.is_published).map((question) => question.id);

  if (input.sections.length === 0) {
    warnings.push({
      code: "missing_theory",
      severity: "critical",
      message: "Липсва теория за деня.",
    });
  }

  if (counts.quiz < 10) {
    warnings.push({
      code: "quiz_under_target",
      severity: "warning",
      message: `ПРОВЕРИ има ${counts.quiz}/10 задачи.`,
    });
  }

  if (counts.practice < 10) {
    warnings.push({
      code: "practice_under_target",
      severity: "warning",
      message: `УПРАЖНИ има ${counts.practice}/10 задачи.`,
    });
  }

  if (counts.bonus < 10) {
    warnings.push({
      code: "bonus_under_target",
      severity: "warning",
      message: `ИЗПИТАЙ СЕ има ${counts.bonus}/10 задачи.`,
    });
  }

  if (missingExplanationIds.length > 0) {
    warnings.push({
      code: "missing_explanations",
      severity: "warning",
      message: `Липсват ${missingExplanationIds.length} explanation полета.`,
    });
  }

  if (duplicatePromptGroups.length > 0) {
    warnings.push({
      code: "duplicate_prompts",
      severity: "warning",
      message: `Открити са ${duplicatePromptGroups.length} групи с дублирани или почти еднакви условия.`,
    });
  }

  if (missingCorrectAnswerIds.length > 0) {
    warnings.push({
      code: "missing_correct_answer",
      severity: "critical",
      message: `${missingCorrectAnswerIds.length} задачи са без resolved correct answer.`,
    });
  }

  if (missingOptionsIds.length > 0) {
    warnings.push({
      code: "missing_options",
      severity: "critical",
      message: `${missingOptionsIds.length} задачи нямат options.`,
    });
  }

  if (duplicateSortOrders.length > 0) {
    warnings.push({
      code: "duplicate_sort_order",
      severity: "warning",
      message: `Открити са ${duplicateSortOrders.length} конфликта със sort_order.`,
    });
  }

  if (unpublishedQuestionIds.length > 0) {
    warnings.push({
      code: "unpublished_questions",
      severity: "info",
      message: `${unpublishedQuestionIds.length} задачи са непубликувани.`,
    });
  }

  if (emptyTopicIds.length > 0) {
    warnings.push({
      code: "empty_topic",
      severity: "warning",
      message: `${emptyTopicIds.length} задачи са без topic.`,
    });
  }

  return {
    warnings,
    duplicatePromptGroups,
    duplicateSortOrders,
    missingExplanationIds,
    missingCorrectAnswerIds,
    missingOptionsIds,
    emptyTopicIds,
    unpublishedQuestionIds,
  };
}

async function getCourseAuditContext() {
  const supabase = createServiceRoleSupabaseClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, slug, title")
    .eq("slug", DEFAULT_COURSE_SLUG)
    .maybeSingle();

  if (courseError) {
    throw new Error(courseError.message);
  }

  if (!course) {
    throw new Error(`Course ${DEFAULT_COURSE_SLUG} was not found.`);
  }

  const [{ data: days, error: daysError }, { data: lessons, error: lessonsError }, { data: sections, error: sectionsError }, { data: questions, error: questionsError }, { data: questionOptions, error: questionOptionsError }] =
    await Promise.all([
      supabase.from("course_days").select("*").eq("course_id", course.id).order("day_number", { ascending: true }),
      supabase.from("lessons").select("*").order("sort_order", { ascending: true }),
      supabase.from("lesson_sections").select("*").order("sort_order", { ascending: true }),
      supabase.from("questions").select("*").order("sort_order", { ascending: true }),
      supabase.from("question_options").select("*").order("sort_order", { ascending: true }),
    ]);

  if (daysError) {
    throw new Error(daysError.message);
  }
  if (lessonsError) {
    throw new Error(lessonsError.message);
  }
  if (sectionsError) {
    throw new Error(sectionsError.message);
  }
  if (questionsError) {
    throw new Error(questionsError.message);
  }
  if (questionOptionsError) {
    throw new Error(questionOptionsError.message);
  }

  const scopedDays = (days ?? []) as CourseDay[];
  const dayIds = new Set(scopedDays.map((day) => day.id));
  const scopedLessons = ((lessons ?? []) as Lesson[]).filter((lesson) => dayIds.has(lesson.course_day_id));
  const lessonIds = new Set(scopedLessons.map((lesson) => lesson.id));
  const scopedSections = ((sections ?? []) as LessonSection[]).filter((section) => lessonIds.has(section.lesson_id));
  const scopedQuestions = ((questions ?? []) as Question[]).filter((question) => dayIds.has(question.course_day_id));
  const questionIds = new Set(scopedQuestions.map((question) => question.id));
  const scopedQuestionOptions = ((questionOptions ?? []) as QuestionOption[]).filter((option) =>
    questionIds.has(option.question_id),
  );

  return {
    course: {
      id: course.id as string,
      slug: course.slug as string,
      title: course.title as string,
    },
    days: scopedDays,
    lessons: scopedLessons,
    sections: scopedSections,
    questions: scopedQuestions,
    questionOptions: scopedQuestionOptions,
  } satisfies CourseAuditContext;
}

function buildDayCardAudit(context: CourseAuditContext, dayNumber: number): AdminDayCardAudit {
  const day = context.days.find((candidate) => candidate.day_number === dayNumber) ?? null;
  if (!day) {
    return {
      dayNumber,
      title: `Ден ${dayNumber}`,
      status: "missing",
      hasTheory: false,
      videoStatus: "missing",
      hasVideo: false,
      readSectionCount: 0,
      quizCount: 0,
      practiceCount: 0,
      bonusCount: 0,
      totalQuestions: 0,
      questionsWithExplanation: 0,
      questionsWithoutExplanation: 0,
      duplicateQuestionCount: 0,
      warnings: [
        {
          code: "missing_theory",
          severity: "critical",
          message: "Липсва ден или теория.",
        },
      ],
    };
  }

  const lesson = getDayLesson(context.lessons, day.id);
  const sections = getDaySections(context.sections, lesson?.id ?? null);
  const questions = context.questions.filter((question) => question.course_day_id === day.id);
  const optionsByQuestionId = getQuestionOptionsMap(
    context.questionOptions.filter((option) => questions.some((question) => question.id === option.question_id)),
  );
  const counts = getQuestionGroupCounts(questions);
  const checks = buildWarnings({ lesson, sections, questions, optionsByQuestionId });

  return {
    dayNumber,
    title: day.title,
    status: day.is_published ? "published" : "draft",
    hasTheory: sections.length > 0,
    videoStatus: !lesson?.video_url ? "missing" : lesson.video_status === "published" ? "published" : "draft",
    hasVideo: Boolean(lesson?.video_url),
    readSectionCount: sections.length,
    quizCount: counts.quiz,
    practiceCount: counts.practice,
    bonusCount: counts.bonus,
    totalQuestions: questions.length,
    questionsWithExplanation: questions.filter((question) => hasText(question.explanation)).length,
    questionsWithoutExplanation: checks.missingExplanationIds.length,
    duplicateQuestionCount: checks.duplicatePromptGroups.reduce((sum, group) => sum + group.questionIds.length, 0),
    warnings: checks.warnings,
  };
}

export async function getAdminDashboardAudit(): Promise<AdminDashboardAudit> {
  const context = await getCourseAuditContext();
  const dayAudits = Array.from({ length: ADMIN_TOTAL_DAYS }, (_, index) => buildDayCardAudit(context, index + 1));

  return {
    course: context.course,
    summary: {
      publishedDays: dayAudits.filter((day) => day.status === "published").length,
      totalDays: ADMIN_TOTAL_DAYS,
      totalLessonSections: context.sections.length,
      publishedQuestions: context.questions.filter((question) => question.is_published).length,
      publishedVideos: context.lessons.filter((lesson) => lesson.video_url && lesson.video_status === "published").length,
      missingAskMatExplanations: context.questions.filter((question) => !hasText(question.explanation)).length,
      potentialDuplicateQuestions: dayAudits.reduce((sum, day) => sum + day.duplicateQuestionCount, 0),
    },
    days: dayAudits,
  };
}

export async function getAdminDayAudit(dayNumber: number): Promise<AdminDayAudit> {
  const context = await getCourseAuditContext();
  const day = context.days.find((candidate) => candidate.day_number === dayNumber) ?? null;

  if (!day) {
    return {
      course: context.course,
      dayNumber,
      exists: false,
      overview: {
        title: `Ден ${dayNumber}`,
        status: "missing",
        readiness: "missing",
        theorySectionCount: 0,
        videoStatus: "missing",
        quizCount: 0,
        practiceCount: 0,
        bonusCount: 0,
        totalQuestions: 0,
        questionsWithExplanation: 0,
        questionsWithoutExplanation: 0,
        duplicateQuestionCount: 0,
        warnings: [
          {
            code: "missing_theory",
            severity: "critical",
            message: "Денят не съществува.",
          },
        ],
      },
      read: {
        day: null,
        lesson: null,
        sections: [],
      },
      quiz: { count: 0, publishedCount: 0, items: [] },
      practice: { count: 0, publishedCount: 0, items: [] },
      bonus: { count: 0, publishedCount: 0, items: [] },
      askMat: {
        totalQuestions: 0,
        withExplanation: 0,
        withoutExplanation: 0,
        items: [],
      },
      checks: {
        warnings: [],
        duplicatePromptGroups: [],
        duplicateSortOrders: [],
        missingExplanationIds: [],
        missingCorrectAnswerIds: [],
        missingOptionsIds: [],
        emptyTopicIds: [],
        unpublishedQuestionIds: [],
      },
    };
  }

  const lesson = getDayLesson(context.lessons, day.id);
  const sections = getDaySections(context.sections, lesson?.id ?? null);
  const questions = context.questions.filter((question) => question.course_day_id === day.id);
  const dayQuestionOptions = context.questionOptions.filter((option) =>
    questions.some((question) => question.id === option.question_id),
  );
  const optionsByQuestionId = getQuestionOptionsMap(dayQuestionOptions);
  const checks = buildWarnings({ lesson, sections, questions, optionsByQuestionId });

  const questionItems = questions.map((question) => getQuestionAuditItem(question, optionsByQuestionId.get(question.id) ?? []));
  const quizItems = questionItems.filter((question) => question.questionGroup === "quiz");
  const practiceItems = questionItems.filter((question) => question.questionGroup === "practice");
  const bonusItems = questionItems.filter((question) => question.questionGroup === "bonus");
  const readiness = checks.warnings.some((warning) => warning.severity === "critical")
    ? "warning"
    : checks.warnings.length > 0
      ? "warning"
      : "ready";

  return {
    course: context.course,
    dayNumber,
    exists: true,
    overview: {
      title: day.title,
      status: day.is_published ? "published" : "draft",
      readiness,
      theorySectionCount: sections.length,
      videoStatus: !lesson?.video_url ? "missing" : lesson.video_status === "published" ? "published" : "draft",
      quizCount: quizItems.length,
      practiceCount: practiceItems.length,
      bonusCount: bonusItems.length,
      totalQuestions: questionItems.length,
      questionsWithExplanation: questionItems.filter((item) => item.hasExplanation).length,
      questionsWithoutExplanation: checks.missingExplanationIds.length,
      duplicateQuestionCount: checks.duplicatePromptGroups.reduce((sum, group) => sum + group.questionIds.length, 0),
      warnings: checks.warnings,
    },
    read: {
      day,
      lesson,
      sections,
    },
    quiz: {
      count: quizItems.length,
      publishedCount: quizItems.filter((item) => item.isPublished).length,
      items: quizItems,
    },
    practice: {
      count: practiceItems.length,
      publishedCount: practiceItems.filter((item) => item.isPublished).length,
      items: practiceItems,
    },
    bonus: {
      count: bonusItems.length,
      publishedCount: bonusItems.filter((item) => item.isPublished).length,
      items: bonusItems,
    },
    askMat: {
      totalQuestions: questionItems.length,
      withExplanation: questionItems.filter((item) => item.hasExplanation).length,
      withoutExplanation: checks.missingExplanationIds.length,
      items: questionItems.map((item) => ({
        id: item.id,
        group: item.questionGroup,
        questionText: item.questionText,
        hasExplanation: item.hasExplanation,
      })),
    },
    checks,
  };
}
