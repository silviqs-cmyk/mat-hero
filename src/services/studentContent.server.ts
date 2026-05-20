import "server-only";

import { DEFAULT_COURSE_SLUG } from "@/services/courses";
import { listPublishedLessonSectionsCompat } from "@/services/lessonSectionsCompat";
import { resolveQuestionGroup, type QuestionGroup } from "@/lib/questionGroups";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Course, CourseDay, CourseWithDays, DayContentBundle, Lesson, Question, QuestionOption } from "@/types/course";
import type { DayResult, UserAnswer, UserProgress } from "@/types/user";

export interface TopicDiagnostic {
  topic: string;
  score: number;
  correctCount: number;
  totalCount: number;
  dayNumbers: number[];
}

export interface QuizDaySummary {
  courseDayId: string;
  dayNumber: number;
  percentage: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
  weakTopics: string[];
}

export async function getPublishedCourseBySlugServer(courseSlug: string): Promise<CourseWithDays | null> {
  const supabase = await createServerSupabaseClient();
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", courseSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!course) {
    return null;
  }

  const { data: days, error: daysError } = await supabase
    .from("course_days")
    .select("*")
    .eq("course_id", course.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (daysError) {
    throw new Error(daysError.message);
  }

  return {
    ...(course as Course),
    days: (days ?? []) as CourseWithDays["days"],
  };
}

export async function getDefaultPublishedCourseServer(): Promise<CourseWithDays | null> {
  return getPublishedCourseBySlugServer(DEFAULT_COURSE_SLUG);
}

export async function getDefaultCourseServer(): Promise<CourseWithDays | null> {
  return getDefaultPublishedCourseServer();
}

export async function getCourseDayByNumberServer(dayNumber: number): Promise<DayContentBundle | null> {
  return getCourseDayServer(DEFAULT_COURSE_SLUG, dayNumber);
}

export async function getCourseDayServer(courseSlug: string, dayNumber: number): Promise<DayContentBundle | null> {
  const supabase = await createServerSupabaseClient();
  const course = await getPublishedCourseBySlugServer(courseSlug);

  if (!course) {
    return null;
  }

  const { data: day, error: dayError } = await supabase
    .from("course_days")
    .select("*")
    .eq("course_id", course.id)
    .eq("day_number", dayNumber)
    .eq("is_published", true)
    .maybeSingle();

  if (dayError) {
    throw new Error(dayError.message);
  }

  if (!day) {
    return null;
  }

  const [{ data: lessons }, { data: questions }] = await Promise.all([
    supabase
      .from("lessons")
      .select("*")
      .eq("course_day_id", day.id)
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("questions")
      .select("*")
      .eq("course_day_id", day.id)
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  ]);

  const lessonsWithSections = await Promise.all(
    ((lessons ?? []) as Lesson[]).map(async (lesson) => {
      return {
        ...lesson,
        sections: await listPublishedLessonSectionsCompat(supabase, lesson.id),
      };
    }),
  );

  return {
    course,
    day: day as CourseDay,
    lessons: lessonsWithSections,
    questions: (questions ?? []) as Question[],
  };
}

export async function getLessonForDayServer(dayNumber: number): Promise<Lesson | null> {
  const bundle = await getCourseDayByNumberServer(dayNumber);
  return bundle?.lessons[0] ?? null;
}

export async function getLessonSectionsServer(dayNumber: number) {
  const lesson = await getLessonForDayServer(dayNumber);
  return lesson?.sections ?? [];
}

export async function getQuestionsWithOptionsForDayServer(
  dayId: string,
  includeBonus = true,
  group?: QuestionGroup,
): Promise<Question[]> {
  const supabase = await createServerSupabaseClient();
  const { data: rawQuestions, error } = await supabase
    .from("questions")
    .select("*")
    .eq("course_day_id", dayId)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const questions = ((rawQuestions ?? []) as Question[]).filter((question) => {
    const resolvedGroup = resolveQuestionGroup(question);

    if (!includeBonus && resolvedGroup === "bonus") {
      return false;
    }

    if (group && resolvedGroup !== group) {
      return false;
    }

    return true;
  });

  const questionIds = questions.map((question) => question.id);
  if (questionIds.length === 0) {
    return [];
  }

  const { data: options, error: optionsError } = await supabase
    .from("question_options")
    .select("*")
    .in("question_id", questionIds)
    .order("sort_order", { ascending: true });

  if (optionsError) {
    throw new Error(optionsError.message);
  }

  const optionsByQuestionId = new Map<string, QuestionOption[]>();
  for (const option of (options ?? []) as QuestionOption[]) {
    const existing = optionsByQuestionId.get(option.question_id) ?? [];
    existing.push(option);
    optionsByQuestionId.set(option.question_id, existing);
  }

  return questions.map((question) => ({
    ...question,
    options: optionsByQuestionId.get(question.id) ?? [],
  }));
}

export async function getUserCourseProgressServer(userId: string, courseId: string): Promise<UserProgress | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as UserProgress | null) ?? null;
}

export async function getUserDayResultServer(userId: string, courseDayId: string): Promise<DayResult | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("day_results")
    .select("*")
    .eq("user_id", userId)
    .eq("course_day_id", courseDayId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as DayResult | null) ?? null;
}

export async function listUserAnswersForDayServer(userId: string, dayId: string): Promise<UserAnswer[]> {
  const supabase = await createServerSupabaseClient();
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id")
    .eq("course_day_id", dayId)
    .eq("is_published", true);

  if (questionsError) {
    throw new Error(questionsError.message);
  }

  const questionIds = (questions ?? []).map((question) => question.id);
  if (questionIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("user_answers")
    .select("*")
    .eq("user_id", userId)
    .in("question_id", questionIds)
    .order("answered_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as UserAnswer[];
}

export async function listUserResultsServer(userId: string, courseId: string): Promise<DayResult[]> {
  const supabase = await createServerSupabaseClient();
  const { data: days, error: daysError } = await supabase
    .from("course_days")
    .select("id")
    .eq("course_id", courseId);

  if (daysError) {
    throw new Error(daysError.message);
  }

  const dayIds = (days ?? []).map((day) => day.id);
  if (dayIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("day_results")
    .select("*")
    .eq("user_id", userId)
    .in("course_day_id", dayIds)
    .order("completed_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DayResult[];
}

export async function getUserTopicDiagnosticsServer(userId: string, courseId: string): Promise<TopicDiagnostic[]> {
  const supabase = await createServerSupabaseClient();
  const { data: days, error: daysError } = await supabase
    .from("course_days")
    .select("id, day_number")
    .eq("course_id", courseId);

  if (daysError) {
    throw new Error(daysError.message);
  }

  const dayRows = days ?? [];
  const dayIds = dayRows.map((day) => day.id);
  if (dayIds.length === 0) {
    return [];
  }

  const dayNumberById = new Map(dayRows.map((day) => [day.id as string, day.day_number as number]));

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id, topic, course_day_id")
    .in("course_day_id", dayIds)
    .eq("is_published", true);

  if (questionsError) {
    throw new Error(questionsError.message);
  }

  const questionRows = questions ?? [];
  const questionIds = questionRows.map((question) => question.id);
  if (questionIds.length === 0) {
    return [];
  }

  const questionMetaById = new Map(
    questionRows.map((question) => [
      question.id as string,
      {
        topic: (question.topic as string | null)?.trim() || "Без тема",
        dayNumber: dayNumberById.get(question.course_day_id as string) ?? null,
      },
    ]),
  );

  const { data: answers, error: answersError } = await supabase
    .from("user_answers")
    .select("question_id, is_correct")
    .eq("user_id", userId)
    .in("question_id", questionIds);

  if (answersError) {
    throw new Error(answersError.message);
  }

  const statsByTopic = new Map<
    string,
    { label: string; correctCount: number; totalCount: number; dayNumbers: Set<number> }
  >();

  for (const answer of answers ?? []) {
    const meta = questionMetaById.get(answer.question_id as string);
    if (!meta) {
      continue;
    }

    const normalizedTopic = meta.topic.toLocaleLowerCase("bg-BG");
    const current = statsByTopic.get(normalizedTopic) ?? {
      label: meta.topic,
      correctCount: 0,
      totalCount: 0,
      dayNumbers: new Set<number>(),
    };

    current.totalCount += 1;
    if (answer.is_correct) {
      current.correctCount += 1;
    }
    if (meta.dayNumber) {
      current.dayNumbers.add(meta.dayNumber);
    }

    statsByTopic.set(normalizedTopic, current);
  }

  return Array.from(statsByTopic.entries())
    .map(([, stats]) => ({
      topic: stats.label,
      score: stats.totalCount > 0 ? Math.round((stats.correctCount / stats.totalCount) * 100) : 0,
      correctCount: stats.correctCount,
      totalCount: stats.totalCount,
      dayNumbers: Array.from(stats.dayNumbers).sort((left, right) => left - right),
    }))
    .sort((left, right) => right.score - left.score);
}

export async function getUserQuizDaySummariesServer(userId: string, courseId: string): Promise<QuizDaySummary[]> {
  const supabase = await createServerSupabaseClient();
  const { data: days, error: daysError } = await supabase
    .from("course_days")
    .select("id, day_number")
    .eq("course_id", courseId);

  if (daysError) {
    throw new Error(daysError.message);
  }

  const dayRows = days ?? [];
  const dayIds = dayRows.map((day) => day.id);
  if (dayIds.length === 0) {
    return [];
  }

  const dayNumberById = new Map(dayRows.map((day) => [day.id as string, day.day_number as number]));

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .in("course_day_id", dayIds)
    .eq("is_published", true);

  if (questionsError) {
    throw new Error(questionsError.message);
  }

  const quizQuestions = (questions ?? []).filter((question) => resolveQuestionGroup(question) === "quiz");
  const questionIds = quizQuestions.map((question) => question.id);
  if (questionIds.length === 0) {
    return [];
  }

  const questionMetaById = new Map(
    quizQuestions.map((question) => [
      question.id as string,
      {
        courseDayId: question.course_day_id as string,
        dayNumber: dayNumberById.get(question.course_day_id as string) ?? 0,
        topic: (question.topic as string | null)?.trim() || "Без тема",
        points: question.points as number,
      },
    ]),
  );

  const { data: answers, error: answersError } = await supabase
    .from("user_answers")
    .select("question_id, is_correct, points_earned, answered_at")
    .eq("user_id", userId)
    .in("question_id", questionIds)
    .order("answered_at", { ascending: false });

  if (answersError) {
    throw new Error(answersError.message);
  }

  const latestAnswerByQuestionId = new Map<
    string,
    { isCorrect: boolean; pointsEarned: number; answeredAt: string }
  >();

  for (const answer of answers ?? []) {
    const questionId = answer.question_id as string;
    if (!latestAnswerByQuestionId.has(questionId)) {
      latestAnswerByQuestionId.set(questionId, {
        isCorrect: Boolean(answer.is_correct),
        pointsEarned: answer.points_earned as number,
        answeredAt: answer.answered_at as string,
      });
    }
  }

  const summaryByDay = new Map<
    string,
    {
      dayNumber: number;
      score: number;
      totalQuestions: number;
      totalPoints: number;
      completedAt: string;
      weakTopics: Set<string>;
    }
  >();

  for (const [questionId, answer] of latestAnswerByQuestionId.entries()) {
    const meta = questionMetaById.get(questionId);
    if (!meta) {
      continue;
    }

    const current = summaryByDay.get(meta.courseDayId) ?? {
      dayNumber: meta.dayNumber,
      score: 0,
      totalQuestions: 0,
      totalPoints: 0,
      completedAt: answer.answeredAt,
      weakTopics: new Set<string>(),
    };

    current.totalQuestions += 1;
    current.totalPoints += meta.points;
    current.score += answer.pointsEarned;
    if (!answer.isCorrect) {
      current.weakTopics.add(meta.topic);
    }
    if (answer.answeredAt > current.completedAt) {
      current.completedAt = answer.answeredAt;
    }

    summaryByDay.set(meta.courseDayId, current);
  }

  return Array.from(summaryByDay.entries())
    .map(([courseDayId, summary]) => ({
      courseDayId,
      dayNumber: summary.dayNumber,
      percentage: summary.totalPoints > 0 ? Math.round((summary.score / summary.totalPoints) * 100) : 0,
      score: summary.score,
      totalQuestions: summary.totalQuestions,
      completedAt: summary.completedAt,
      weakTopics: Array.from(summary.weakTopics),
    }))
    .sort((left, right) => right.completedAt.localeCompare(left.completedAt));
}
