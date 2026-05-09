import "server-only";

import { DEFAULT_COURSE_SLUG } from "@/services/courses";
import { resolveQuestionGroup, type QuestionGroup } from "@/lib/questionGroups";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Course, CourseDay, CourseWithDays, DayContentBundle, Lesson, Question, QuestionOption } from "@/types/course";
import type { DayResult, UserAnswer, UserProgress } from "@/types/user";

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
      const { data: sections, error: sectionsError } = await supabase
        .from("lesson_sections")
        .select("*")
        .eq("lesson_id", lesson.id)
        .order("sort_order", { ascending: true });

      if (sectionsError) {
        throw new Error(sectionsError.message);
      }

      return {
        ...lesson,
        sections: sections ?? [],
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
