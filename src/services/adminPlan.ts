"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getNetworkErrorMessage } from "@/lib/auth/client";
import { getQuestionGroupFlags, resolveQuestionGroup, type QuestionGroup } from "@/lib/questionGroups";
import {
  normalizeLessonSection,
  replaceLessonSectionsForLessonCompat,
  saveLessonSectionCompat,
} from "@/services/lessonSectionsCompat";
import type { Course, CourseDay, Lesson, LessonSection, Question, QuestionOption } from "@/types/course";
import type { CourseDayInput, LessonInput, LessonSectionInput, QuestionInput } from "@/types/admin";

export const DEFAULT_ADMIN_COURSE_SLUG = "nvo-matematika-7-klas";
const DEFAULT_ADMIN_COURSE_TITLE = "10-дневна подготовка по математика";
const DEFAULT_ADMIN_COURSE_DESCRIPTION = "Основният MatHero продукт за НВО по математика в 7. клас.";
export const ADMIN_PLAN_TOTAL_DAYS = 10;

export type AdminQuestionGroup = QuestionGroup;

export interface AdminPlanDayCard {
  dayNumber: number;
  day: CourseDay | null;
  lesson: Lesson | null;
  title: string;
  subtitle: string;
  status: "draft" | "published" | "missing";
  hasLesson: boolean;
  hasVideo: boolean;
  practiceCount: number;
  quizCount: number;
  bonusCount: number;
}

export interface AdminPlanSnapshot {
  course: Course;
  days: CourseDay[];
  lessons: Lesson[];
  sections: LessonSection[];
  questions: Question[];
  questionOptions: QuestionOption[];
  dayCards: AdminPlanDayCard[];
}

function withAdminPlanRequest<T>(operation: () => Promise<T>): Promise<T> {
  return operation().catch((error) => {
    throw new Error(getNetworkErrorMessage(error));
  });
}

export function getResolvedQuestionGroup(
  question: Pick<Question, "question_group" | "is_bonus">,
): AdminQuestionGroup {
  return resolveQuestionGroup(question);
}

function detectVideoProviderFromUrl(videoUrl: string | null) {
  if (!videoUrl) {
    return "none" as const;
  }

  try {
    const url = new URL(videoUrl);
    if (url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")) {
      return "youtube" as const;
    }
    if (url.hostname.includes("vimeo.com")) {
      return "vimeo" as const;
    }
    return "external" as const;
  } catch {
    return "external" as const;
  }
}

export async function ensureDefaultAdminCourse(): Promise<Course> {
  return withAdminPlanRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: existing, error: selectError } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", DEFAULT_ADMIN_COURSE_SLUG)
      .maybeSingle();

    if (selectError) {
      throw new Error(selectError.message);
    }

    if (existing) {
      return existing as Course;
    }

    const { data, error } = await supabase
      .from("courses")
      .insert({
        title: DEFAULT_ADMIN_COURSE_TITLE,
        slug: DEFAULT_ADMIN_COURSE_SLUG,
        description: DEFAULT_ADMIN_COURSE_DESCRIPTION,
        subject: "Математика",
        grade: 7,
        duration_days: ADMIN_PLAN_TOTAL_DAYS,
        is_published: false,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Course;
  });
}

export async function getAdminPlanSnapshot(): Promise<AdminPlanSnapshot> {
  return withAdminPlanRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    const course = await ensureDefaultAdminCourse();

    const [{ data: days }, { data: lessons }, { data: sections }, { data: questions }, { data: questionOptions }] =
      await Promise.all([
        supabase.from("course_days").select("*").eq("course_id", course.id).order("day_number", { ascending: true }),
        supabase.from("lessons").select("*").order("sort_order", { ascending: true }),
        supabase.from("lesson_sections").select("*").order("sort_order", { ascending: true }),
        supabase.from("questions").select("*").order("sort_order", { ascending: true }),
        supabase.from("question_options").select("*").order("sort_order", { ascending: true }),
      ]);

    const scopedDays = ((days ?? []) as CourseDay[]).filter((day) => day.course_id === course.id);
    const dayIds = new Set(scopedDays.map((day) => day.id));
    const scopedLessons = ((lessons ?? []) as Lesson[]).filter((lesson) => dayIds.has(lesson.course_day_id));
    const lessonIds = new Set(scopedLessons.map((lesson) => lesson.id));
    const scopedSections = ((sections ?? []) as LessonSection[])
      .filter((section) => lessonIds.has(section.lesson_id))
      .map((section) => normalizeLessonSection(section));
    const scopedQuestions = ((questions ?? []) as Question[]).filter((question) => dayIds.has(question.course_day_id));
    const questionIds = new Set(scopedQuestions.map((question) => question.id));
    const scopedQuestionOptions = ((questionOptions ?? []) as QuestionOption[]).filter((option) =>
      questionIds.has(option.question_id),
    );

    const dayCards: AdminPlanDayCard[] = Array.from({ length: ADMIN_PLAN_TOTAL_DAYS }, (_, index) => {
      const dayNumber = index + 1;
      const day = scopedDays.find((candidate) => candidate.day_number === dayNumber) ?? null;
      const lesson = day
        ? scopedLessons
            .filter((candidate) => candidate.course_day_id === day.id)
            .sort((left, right) => left.sort_order - right.sort_order)[0] ?? null
        : null;
      const dayQuestions = day ? scopedQuestions.filter((question) => question.course_day_id === day.id) : [];
      const practiceCount = dayQuestions.filter((question) => getResolvedQuestionGroup(question) === "practice").length;
      const quizCount = dayQuestions.filter((question) => getResolvedQuestionGroup(question) === "quiz").length;
      const bonusCount = dayQuestions.filter((question) => getResolvedQuestionGroup(question) === "bonus").length;

      return {
        dayNumber,
        day,
        lesson,
        title: day?.title ?? `Ден ${dayNumber}`,
        subtitle: day?.subtitle ?? "Все още няма съдържание за този ден.",
        status: !day ? "missing" : day.is_published ? "published" : "draft",
        hasLesson: Boolean(lesson),
        hasVideo: Boolean(lesson?.video_url && lesson.video_status === "published"),
        practiceCount,
        quizCount,
        bonusCount,
      };
    });

    return {
      course,
      days: scopedDays,
      lessons: scopedLessons,
      sections: scopedSections,
      questions: scopedQuestions,
      questionOptions: scopedQuestionOptions,
      dayCards,
    };
  });
}

export async function ensurePlanDay(dayNumber: number): Promise<CourseDay> {
  return withAdminPlanRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    const course = await ensureDefaultAdminCourse();
    const { data: existing, error: existingError } = await supabase
      .from("course_days")
      .select("*")
      .eq("course_id", course.id)
      .eq("day_number", dayNumber)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existing) {
      return existing as CourseDay;
    }

    const { data, error } = await supabase
      .from("course_days")
      .insert({
        course_id: course.id,
        day_number: dayNumber,
        title: `Ден ${dayNumber}`,
        subtitle: "",
        description: "",
        estimated_minutes: 45,
        is_published: false,
        sort_order: dayNumber,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as CourseDay;
  });
}

export async function savePlanDay(dayId: string, input: CourseDayInput): Promise<CourseDay> {
  return withAdminPlanRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.from("course_days").update(input).eq("id", dayId).select("*").single();
    if (error) {
      throw new Error(error.message);
    }
    return data as CourseDay;
  });
}

export async function savePlanLesson(lessonId: string | null, input: LessonInput): Promise<Lesson> {
  return withAdminPlanRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    const payload = {
      course_day_id: input.course_day_id,
      title: input.title,
      type: input.type,
      content: input.content,
      video_url: input.video_url,
      video_provider: input.video_provider || detectVideoProviderFromUrl(input.video_url),
      video_title: input.video_title || null,
      video_thumbnail_url: input.video_thumbnail_url || null,
      video_duration_seconds: input.video_duration_seconds,
      video_status: input.video_status,
      video_storage_path: input.video_storage_path,
      estimated_minutes: input.estimated_minutes,
      sort_order: input.sort_order,
      is_published: input.is_published,
    };

    if (!lessonId) {
      const { data, error } = await supabase.from("lessons").insert(payload).select("*").single();
      if (error) {
        throw new Error(error.message);
      }
      return data as Lesson;
    }

    const { data, error } = await supabase.from("lessons").update(payload).eq("id", lessonId).select("*").single();
    if (error) {
      throw new Error(error.message);
    }
    return data as Lesson;
  });
}

export async function savePlanSection(sectionId: string | null, input: LessonSectionInput): Promise<LessonSection> {
  return withAdminPlanRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    const payload = {
      ...input,
      video_provider: input.video_url ? detectVideoProviderFromUrl(input.video_url) : "none",
      video_status: input.video_url ? input.video_status : "draft",
    };
    return saveLessonSectionCompat(supabase, sectionId, payload);
  });
}

export async function setAdminCoursePublishedState(courseId: string, isPublished: boolean): Promise<Course> {
  return withAdminPlanRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("courses")
      .update({ is_published: isPublished })
      .eq("id", courseId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Course;
  });
}

export async function replacePlanSectionsForLesson(
  lessonId: string,
  inputs: LessonSectionInput[],
): Promise<LessonSection[]> {
  return withAdminPlanRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    const payload = inputs.map((input) => ({
      ...input,
      lesson_id: lessonId,
      video_provider: input.video_url ? detectVideoProviderFromUrl(input.video_url) : "none",
      video_status: input.video_url ? input.video_status : "draft",
    }));
    return replaceLessonSectionsForLessonCompat(supabase, lessonId, payload);
  });
}

export async function removePlanSection(sectionId: string): Promise<void> {
  return withAdminPlanRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("lesson_sections").delete().eq("id", sectionId);
    if (error) {
      throw new Error(error.message);
    }
  });
}

export async function reorderPlanSections(sectionIdsInOrder: string[]): Promise<void> {
  return withAdminPlanRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    const updates = sectionIdsInOrder.map((sectionId, index) =>
      supabase.from("lesson_sections").update({ sort_order: index + 1 }).eq("id", sectionId),
    );
    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);
    if (failed?.error) {
      throw new Error(failed.error.message);
    }
  });
}

export async function savePlanQuestion(questionId: string | null, input: QuestionInput): Promise<Question> {
  return withAdminPlanRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    const questionFlags = getQuestionGroupFlags(input);
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
      source_year: input.source_year,
      ...questionFlags,
      sort_order: input.sort_order,
      is_published: input.is_published,
    };

    if (!questionId) {
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

    const { data, error } = await supabase.from("questions").update(payload).eq("id", questionId).select("*").single();
    if (error) {
      throw new Error(error.message);
    }

    const { error: deleteOptionsError } = await supabase.from("question_options").delete().eq("question_id", questionId);
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
  });
}

export async function removePlanQuestion(questionId: string): Promise<void> {
  return withAdminPlanRequest(async () => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("questions").delete().eq("id", questionId);
    if (error) {
      throw new Error(error.message);
    }
  });
}
