import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getNetworkErrorMessage } from "@/lib/auth/client";
import type {
  AdminDashboardStats,
  AdminUserOverview,
  CourseDayInput,
  CourseInput,
  LessonInput,
  LessonSectionInput,
  QuestionInput,
} from "@/types/admin";
import type {
  Course,
  CourseDay,
  Lesson,
  LessonSection,
  Question,
  QuestionOption,
} from "@/types/course";
import type { DayResult, UserProfile, UserProgress } from "@/types/user";

async function withAdminRequest<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error));
  }
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  return withAdminRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    const [{ count: totalCourses }, { count: publishedDays }, { count: totalStudents }, { data: results }] =
      await Promise.all([
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("course_days").select("*", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("day_results").select("percentage"),
      ]);

    const averageResultPercentage = results?.length
      ? Math.round(results.reduce((sum, row) => sum + (row.percentage as number), 0) / results.length)
      : 0;

    return {
      totalCourses: totalCourses ?? 0,
      publishedDays: publishedDays ?? 0,
      totalStudents: totalStudents ?? 0,
      averageResultPercentage,
    };
  });
}

export async function listAdminCourses(): Promise<Course[]> {
  return withAdminRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as Course[];
  });
}

export async function createCourse(input: CourseInput): Promise<Course> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.from("courses").insert(input).select("*").single();
  if (error) {
    throw new Error(error.message);
  }
  return data as Course;
}

export async function updateCourse(courseId: string, input: CourseInput): Promise<Course> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.from("courses").update(input).eq("id", courseId).select("*").single();
  if (error) {
    throw new Error(error.message);
  }
  return data as Course;
}

export async function deleteCourse(courseId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function listAdminDays(courseId?: string): Promise<CourseDay[]> {
  return withAdminRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    let query = supabase.from("course_days").select("*").order("sort_order", { ascending: true });
    if (courseId) {
      query = query.eq("course_id", courseId);
    }
    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as CourseDay[];
  });
}

export async function createDay(input: CourseDayInput): Promise<CourseDay> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.from("course_days").insert(input).select("*").single();
  if (error) {
    throw new Error(error.message);
  }
  return data as CourseDay;
}

export async function updateDay(dayId: string, input: CourseDayInput): Promise<CourseDay> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.from("course_days").update(input).eq("id", dayId).select("*").single();
  if (error) {
    throw new Error(error.message);
  }
  return data as CourseDay;
}

export async function deleteDay(dayId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("course_days").delete().eq("id", dayId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function listAdminLessons(dayId?: string): Promise<Lesson[]> {
  return withAdminRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    let query = supabase.from("lessons").select("*").order("sort_order", { ascending: true });
    if (dayId) {
      query = query.eq("course_day_id", dayId);
    }
    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as Lesson[];
  });
}

export async function createLesson(input: LessonInput): Promise<Lesson> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.from("lessons").insert(input).select("*").single();
  if (error) {
    throw new Error(error.message);
  }
  return data as Lesson;
}

export async function updateLesson(lessonId: string, input: LessonInput): Promise<Lesson> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.from("lessons").update(input).eq("id", lessonId).select("*").single();
  if (error) {
    throw new Error(error.message);
  }
  return data as Lesson;
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function listLessonSections(lessonId?: string): Promise<LessonSection[]> {
  return withAdminRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    let query = supabase.from("lesson_sections").select("*").order("sort_order", { ascending: true });
    if (lessonId) {
      query = query.eq("lesson_id", lessonId);
    }
    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as LessonSection[];
  });
}

export async function createLessonSection(input: LessonSectionInput): Promise<LessonSection> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.from("lesson_sections").insert(input).select("*").single();
  if (error) {
    throw new Error(error.message);
  }
  return data as LessonSection;
}

export async function updateLessonSection(
  sectionId: string,
  input: LessonSectionInput,
): Promise<LessonSection> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("lesson_sections")
    .update(input)
    .eq("id", sectionId)
    .select("*")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data as LessonSection;
}

export async function deleteLessonSection(sectionId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("lesson_sections").delete().eq("id", sectionId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function listAdminQuestions(dayId?: string): Promise<Question[]> {
  return withAdminRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    let query = supabase.from("questions").select("*").order("sort_order", { ascending: true });
    if (dayId) {
      query = query.eq("course_day_id", dayId);
    }
    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as Question[];
  });
}

export async function getQuestionOptions(questionId: string): Promise<QuestionOption[]> {
  return withAdminRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("question_options")
      .select("*")
      .eq("question_id", questionId)
      .order("sort_order", { ascending: true });
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as QuestionOption[];
  });
}

export async function createQuestion(input: QuestionInput): Promise<Question> {
  const supabase = getSupabaseBrowserClient();
  const payload = {
    course_day_id: input.course_day_id,
    lesson_id: input.lesson_id,
    question_type: input.question_type,
    prompt: input.prompt,
    explanation: input.explanation,
    expected_answer: input.expected_answer,
    difficulty: input.difficulty,
    points: input.points,
    topic: input.topic,
    is_bonus: input.is_bonus,
    sort_order: input.sort_order,
    is_published: input.is_published,
  };

  const { data, error } = await supabase.from("questions").insert(payload).select("*").single();
  if (error) {
    throw new Error(error.message);
  }

  if (input.options && input.options.length > 0) {
    const { error: optionError } = await supabase.from("question_options").insert(
      input.options.map((option) => ({
        question_id: data.id,
        option_text: option.option_text,
        is_correct: option.is_correct,
        sort_order: option.sort_order,
      })),
    );
    if (optionError) {
      throw new Error(optionError.message);
    }
  }

  return data as Question;
}

export async function updateQuestion(questionId: string, input: QuestionInput): Promise<Question> {
  const supabase = getSupabaseBrowserClient();
  const payload = {
    course_day_id: input.course_day_id,
    lesson_id: input.lesson_id,
    question_type: input.question_type,
    prompt: input.prompt,
    explanation: input.explanation,
    expected_answer: input.expected_answer,
    difficulty: input.difficulty,
    points: input.points,
    topic: input.topic,
    is_bonus: input.is_bonus,
    sort_order: input.sort_order,
    is_published: input.is_published,
  };

  const { data, error } = await supabase.from("questions").update(payload).eq("id", questionId).select("*").single();
  if (error) {
    throw new Error(error.message);
  }

  const { error: deleteOptionsError } = await supabase
    .from("question_options")
    .delete()
    .eq("question_id", questionId);
  if (deleteOptionsError) {
    throw new Error(deleteOptionsError.message);
  }

  if (input.options && input.options.length > 0) {
    const { error: insertOptionsError } = await supabase.from("question_options").insert(
      input.options.map((option) => ({
        question_id: questionId,
        option_text: option.option_text,
        is_correct: option.is_correct,
        sort_order: option.sort_order,
      })),
    );
    if (insertOptionsError) {
      throw new Error(insertOptionsError.message);
    }
  }

  return data as Question;
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("questions").delete().eq("id", questionId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function listAdminUsers(): Promise<AdminUserOverview[]> {
  const supabase = getSupabaseBrowserClient();
  const [{ data: profiles }, { data: progress }, { data: results }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "student"),
    supabase.from("user_progress").select("*"),
    supabase.from("day_results").select("*"),
  ]);

  return ((profiles ?? []) as UserProfile[]).map((profile) => ({
    profile,
    progress: ((progress ?? []) as UserProgress[]).filter((item) => item.user_id === profile.id),
    latestResults: ((results ?? []) as DayResult[]).filter((item) => item.user_id === profile.id).slice(0, 5),
  }));
}
